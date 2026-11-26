// GitHub Actions'ta çalışır: Cloudflare hesabını hazırlar, Worker'ı yayınlar, Gemini anahtarını gizli olarak koyar.
// Gerekenler (GitHub → Settings → Secrets → Actions): CLOUDFLARE_API_TOKEN, GEMINI_API_KEY
// Çıktı: GITHUB_OUTPUT'a ai_url=https://ruhhali.<alt-alan>.workers.dev
import { execFileSync } from 'node:child_process';
import { appendFileSync, readFileSync, writeFileSync } from 'node:fs';

const TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const GEMINI = process.env.GEMINI_API_KEY;
if (!TOKEN) {
  console.log('CLOUDFLARE_API_TOKEN yok: yapay zekâ sunucusu atlandı.');
  process.exit(0);
}
const api = async (path, init = {}) => {
  const res = await fetch(`https://api.cloudflare.com/client/v4${path}`, {
    ...init,
    headers: { authorization: `Bearer ${TOKEN}`, 'content-type': 'application/json', ...(init.headers ?? {}) },
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok && data.success !== false, status: res.status, data };
};

// 1) Hesap
const accounts = await api('/accounts');
if (!accounts.ok || !accounts.data.result?.length) {
  console.error('Cloudflare hesabı okunamadı. Token izinlerini kontrol et.', accounts.status, JSON.stringify(accounts.data.errors));
  process.exit(1);
}
const accountId = accounts.data.result[0].id;
console.log('Hesap bulundu.');

// 2) workers.dev alt alanı (yeni hesaplarda yoksa oluştur)
let sub = await api(`/accounts/${accountId}/workers/subdomain`);
let subdomain = sub.ok ? sub.data.result?.subdomain : null;
if (!subdomain) {
  const wanted = `ruhhali-${Math.random().toString(36).slice(2, 8)}`;
  const put = await api(`/accounts/${accountId}/workers/subdomain`, { method: 'PUT', body: JSON.stringify({ subdomain: wanted }) });
  if (!put.ok) {
    console.error('workers.dev alt alanı oluşturulamadı:', put.status, JSON.stringify(put.data.errors));
    process.exit(1);
  }
  subdomain = put.data.result?.subdomain ?? wanted;
  console.log('workers.dev alt alanı oluşturuldu.');
}

// 3) Şarkı önbelleği için KV
const TITLE = 'ruhhali-songs';
const list = await api(`/accounts/${accountId}/storage/kv/namespaces?per_page=100`);
let kv = list.ok ? list.data.result?.find((n) => n.title === TITLE)?.id : null;
if (!kv) {
  const created = await api(`/accounts/${accountId}/storage/kv/namespaces`, { method: 'POST', body: JSON.stringify({ title: TITLE }) });
  if (!created.ok) {
    console.error('KV oluşturulamadı:', created.status, JSON.stringify(created.data.errors));
    process.exit(1);
  }
  kv = created.data.result.id;
  console.log('KV deposu oluşturuldu.');
}

// 4) wrangler.toml + yayın + gizli anahtar
writeFileSync('wrangler.toml', readFileSync('wrangler.template.toml', 'utf8').replace('__KV_ID__', kv));
const env = { ...process.env, CLOUDFLARE_ACCOUNT_ID: accountId };
execFileSync('npx', ['wrangler', 'deploy'], { stdio: 'inherit', env });
if (GEMINI) {
  execFileSync('npx', ['wrangler', 'secret', 'put', 'GEMINI_API_KEY'], { input: GEMINI, stdio: ['pipe', 'inherit', 'inherit'], env });
} else {
  console.log('GEMINI_API_KEY yok: yalnızca Workers AI kullanılacak.');
}

const url = `https://ruhhali.${subdomain}.workers.dev`;
console.log('Yapay zekâ sunucusu hazır:', url);
if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `ai_url=${url}\n`);
