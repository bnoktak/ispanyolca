// Testlerin ortak ayarları: proje klasörü, tarayıcı, geçici profil, ekran görüntüsü klasörü.
// Hiçbir ayar gerekmez. Tarayıcı bulunamazsa: set TARAYICI=C:\...\msedge.exe (ya da chrome.exe / vivaldi.exe)
const path = require('path'), fs = require('fs');

const KOK = path.resolve(__dirname, '..');              // uygulama klasörü
const CIKTI = path.join(__dirname, 'ciktilar');          // ekran görüntüleri + geçici tarayıcı profilleri (git dışında)
fs.mkdirSync(CIKTI, { recursive: true });

// Chromium tabanlı bir tarayıcı gerekir (testler onu görünmez modda açıp yönetir)
const PF = process.env['ProgramFiles'] || 'C:\\Program Files', PF86 = process.env['ProgramFiles(x86)'] || 'C:\\Program Files (x86)', LA = process.env.LOCALAPPDATA || '';
const ADAYLAR = [
  process.env.TARAYICI,
  path.join(PF86, 'Microsoft\\Edge\\Application\\msedge.exe'),
  path.join(PF, 'Microsoft\\Edge\\Application\\msedge.exe'),
  path.join(PF, 'Google\\Chrome\\Application\\chrome.exe'),
  path.join(PF86, 'Google\\Chrome\\Application\\chrome.exe'),
  path.join(LA, 'Google\\Chrome\\Application\\chrome.exe'),
  path.join(LA, 'Vivaldi\\Application\\vivaldi.exe'),
  path.join(PF, 'Vivaldi\\Application\\vivaldi.exe'),
  '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/microsoft-edge', '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser',
].filter(Boolean);
const EDGE = ADAYLAR.find((p) => fs.existsSync(p));
const testAdi = path.basename((require.main && require.main.filename) || 'test', '.js');
if (!EDGE && testAdi !== 'birlestir' && testAdi !== 'scriptable') {
  console.log('HATA tarayıcı bulunamadı (Edge / Chrome / Vivaldi). TARAYICI ortam değişkeniyle yolunu ver.');
  process.exit(1);
}
// her çalıştırmada yeni profil: önceki tarayıcı kapanırken dosyaları kilitli kalabilir
const PROFIL = path.join(CIKTI, `profil-${testAdi}-${Date.now()}`);

// Test bitince tarayıcıyı TAMAMEN kapat. Edge açılışta kendini yeniden başlatır; testin "edge.kill()"i
// yalnızca ilkini kapatır, asıl pencere arkada kalır ve sonraki test aynı porttan ona bağlanır (eski durum → düzensiz hata).
// Bu yüzden komut satırında bu testin profil klasörü geçen bütün tarayıcı süreçleri kapatılır.
function tarayicilariKapat(icerenMetin) {
  const { spawnSync } = require('child_process');
  if (process.platform === 'win32') {
    const m = icerenMetin.replace(/'/g, "''");
    spawnSync('powershell', ['-NoProfile', '-Command',
      `Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -and $_.CommandLine.Contains('${m}') -and $_.CommandLine.Contains('headless') } | ForEach-Object { try { Stop-Process -Id $_.ProcessId -Force -ErrorAction Stop } catch {} }`], { stdio: 'ignore' });
  } else spawnSync('pkill', ['-f', icerenMetin], { stdio: 'ignore' });
}
process.on('exit', () => { if (EDGE) tarayicilariKapat(PROFIL); });

module.exports = { KOK, EDGE, PROFIL, CIKTI, tarayicilariKapat };
