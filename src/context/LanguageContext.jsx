import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from '../utils/router';

export const AVAILABLE_LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸', native: 'English' },
  { code: 'es', name: 'Español', flag: '🇪🇸', native: 'Español' },
  { code: 'fr', name: 'Français', flag: '🇫🇷', native: 'Français' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪', native: 'Deutsch' },
  { code: 'pt', name: 'Português', flag: '🇧🇷', native: 'Português' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹', native: 'Italiano' },
  { code: 'id', name: 'Bahasa Indonesia', flag: '🇮🇩', native: 'Indonesia' },
  { code: 'ja', name: '日本語', flag: '🇯🇵', native: '日本語' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺', native: 'Русский' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳', native: 'हिन्दी' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦', native: 'العربية' },
  { code: 'zh-CN', name: '简体中文', flag: '🇨🇳', native: '中文' },
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷', native: 'Türkçe' },
];

// High-speed localized dictionary for instant UI translation
const UI_TRANSLATIONS = {
  en: {
    'nav.home': 'Video Downloader',
    'nav.youtube': 'YouTube',
    'nav.tiktok': 'TikTok',
    'nav.instagram': 'Instagram',
    'nav.facebook': 'Facebook',
    'nav.reddit': 'Reddit',
    'nav.tools': 'Tools',
    'nav.guides': 'Guides',
    'nav.downloadApp': 'Download App',
    'hero.badge': 'FAST & CLEAN MEDIA RESOLVER',
    'hero.h1': 'Online Video Downloader',
    'hero.mainHeading': 'Download Videos Online',
    'hero.desc': 'Paste a supported video URL below to check available media options and download formats.',
    'input.placeholder': 'Paste video URL here (e.g. https://www.youtube.com/watch?v=...)',
    'input.fetch': 'Fetch Video',
    'input.resolving': 'Analyzing Media...',
    'input.clear': 'Clear',
    'input.paste': 'Paste',
    'input.sample': 'Test with sample link',
    'formats.title': 'Available Download Formats',
    'formats.videoTab': 'Video (MP4)',
    'formats.audioTab': 'Audio (MP3 / M4A)',
    'formats.quality': 'Quality / Resolution',
    'formats.size': 'File Size',
    'formats.format': 'Format',
    'formats.action': 'Action',
    'formats.download': 'Download',
    'formats.processing': 'Processing...',
    'formats.ready': 'Save to PC',
    'footer.disclaimer': 'Independent Service: VidLoader is not affiliated with YouTube, TikTok, Instagram, Facebook, or Reddit.',
  },
  es: {
    'nav.home': 'Descargador de Videos',
    'nav.youtube': 'YouTube',
    'nav.tiktok': 'TikTok',
    'nav.instagram': 'Instagram',
    'nav.facebook': 'Facebook',
    'nav.reddit': 'Reddit',
    'nav.tools': 'Herramientas',
    'nav.guides': 'Guías',
    'nav.downloadApp': 'Descargar App',
    'hero.badge': 'RESOLVEDOR DE MEDIOS RÁPIDO Y LIMPIO',
    'hero.h1': 'Descargador de Videos Online',
    'hero.mainHeading': 'Descargar Videos Gratis en Línea',
    'hero.desc': 'Pega un enlace de video compatible a continuación para ver formatos de descarga y calidades disponibles.',
    'input.placeholder': 'Pega el enlace del video aquí (ej. https://www.youtube.com/watch?v=...)',
    'input.fetch': 'Obtener Video',
    'input.resolving': 'Analizando Enlace...',
    'input.clear': 'Borrar',
    'input.paste': 'Pegar',
    'input.sample': 'Probar con enlace de ejemplo',
    'formats.title': 'Formatos de Descarga Disponibles',
    'formats.videoTab': 'Video (MP4)',
    'formats.audioTab': 'Audio (MP3 / M4A)',
    'formats.quality': 'Calidad / Resolución',
    'formats.size': 'Tamaño',
    'formats.format': 'Formato',
    'formats.action': 'Acción',
    'formats.download': 'Descargar',
    'formats.processing': 'Procesando...',
    'formats.ready': 'Guardar en PC',
    'footer.disclaimer': 'Servicio independiente: VidLoader no está afiliado con YouTube, TikTok, Instagram, Facebook o Reddit.',
  },
  fr: {
    'nav.home': 'Téléchargeur de Vidéos',
    'nav.youtube': 'YouTube',
    'nav.tiktok': 'TikTok',
    'nav.instagram': 'Instagram',
    'nav.facebook': 'Facebook',
    'nav.reddit': 'Reddit',
    'nav.tools': 'Outils',
    'nav.guides': 'Guides',
    'nav.downloadApp': 'Télécharger l\'App',
    'hero.badge': 'CONVERTISSEUR MULTIMÉDIA RAPIDE ET PROPRE',
    'hero.h1': 'Téléchargeur de Vidéos en Ligne',
    'hero.mainHeading': 'Télécharger des Vidéos en Ligne',
    'hero.desc': 'Collez l\'URL d\'une vidéo prise en charge ci-dessous pour explorer les formats et options de téléchargement.',
    'input.placeholder': 'Collez le lien de la vidéo ici (ex: https://www.youtube.com/watch?v=...)',
    'input.fetch': 'Télécharger',
    'input.resolving': 'Analyse en cours...',
    'input.clear': 'Effacer',
    'input.paste': 'Coller',
    'input.sample': 'Essayer un lien d\'exemple',
    'formats.title': 'Formats de Téléchargement Disponibles',
    'formats.videoTab': 'Vidéo (MP4)',
    'formats.audioTab': 'Audio (MP3 / M4A)',
    'formats.quality': 'Qualité / Résolution',
    'formats.size': 'Taille',
    'formats.format': 'Format',
    'formats.action': 'Action',
    'formats.download': 'Télécharger',
    'formats.processing': 'Traitement...',
    'formats.ready': 'Enregistrer sur PC',
    'footer.disclaimer': 'Service indépendant: VidLoader n\'est affilié ni à YouTube, TikTok, Instagram, Facebook, ni à Reddit.',
  },
  de: {
    'nav.home': 'Video-Downloader',
    'nav.youtube': 'YouTube',
    'nav.tiktok': 'TikTok',
    'nav.instagram': 'Instagram',
    'nav.facebook': 'Facebook',
    'nav.reddit': 'Reddit',
    'nav.tools': 'Werkzeuge',
    'nav.guides': 'Anleitungen',
    'nav.downloadApp': 'App herunterladen',
    'hero.badge': 'SCHNELLER & SAUBERER MEDIA RESOLVER',
    'hero.h1': 'Online Video Downloader',
    'hero.mainHeading': 'Videos online herunterladen',
    'hero.desc': 'Fügen Sie eine unterstützte Video-URL ein, um verfügbare Medienoptionen und Downloadformate anzuzeigen.',
    'input.placeholder': 'Video-URL hier einfügen (z. B. https://www.youtube.com/watch?v=...)',
    'input.fetch': 'Video abrufen',
    'input.resolving': 'Wird analysiert...',
    'input.clear': 'Löschen',
    'input.paste': 'Einfügen',
    'input.sample': 'Mit Beispiellink testen',
    'formats.title': 'Verfügbare Downloadformate',
    'formats.videoTab': 'Video (MP4)',
    'formats.audioTab': 'Audio (MP3 / M4A)',
    'formats.quality': 'Qualität / Auflösung',
    'formats.size': 'Dateigröße',
    'formats.format': 'Format',
    'formats.action': 'Aktion',
    'formats.download': 'Herunterladen',
    'formats.processing': 'Verarbeitung...',
    'formats.ready': 'Auf PC speichern',
    'footer.disclaimer': 'Unabhängiger Dienst: VidLoader steht in keiner Verbindung zu YouTube, TikTok, Instagram, Facebook oder Reddit.',
  },
  pt: {
    'nav.home': 'Baixador de Vídeos',
    'nav.youtube': 'YouTube',
    'nav.tiktok': 'TikTok',
    'nav.instagram': 'Instagram',
    'nav.facebook': 'Facebook',
    'nav.reddit': 'Reddit',
    'nav.tools': 'Ferramentas',
    'nav.guides': 'Guias',
    'nav.downloadApp': 'Baixar App',
    'hero.badge': 'RESOLVEDOR DE MÍDIA RÁPIDO E LIMPO',
    'hero.h1': 'Baixador de Vídeos Online',
    'hero.mainHeading': 'Baixar Vídeos Gratuitamente Online',
    'hero.desc': 'Cole uma URL de vídeo suportada abaixo para verificar as opções de mídia e formatos de download.',
    'input.placeholder': 'Cole o link do vídeo aqui (ex: https://www.youtube.com/watch?v=...)',
    'input.fetch': 'Obter Vídeo',
    'input.resolving': 'Analisando mídia...',
    'input.clear': 'Limpar',
    'input.paste': 'Colar',
    'input.sample': 'Testar com link de exemplo',
    'formats.title': 'Formatos de Download Disponíveis',
    'formats.videoTab': 'Vídeo (MP4)',
    'formats.audioTab': 'Áudio (MP3 / M4A)',
    'formats.quality': 'Qualidade / Resolução',
    'formats.size': 'Tamanho',
    'formats.format': 'Formato',
    'formats.action': 'Ação',
    'formats.download': 'Baixar',
    'formats.processing': 'Processando...',
    'formats.ready': 'Salvar no PC',
    'footer.disclaimer': 'Serviço independente: VidLoader não é afiliado ao YouTube, TikTok, Instagram, Facebook ou Reddit.',
  },
  it: {
    'nav.home': 'Downloader Video',
    'nav.youtube': 'YouTube',
    'nav.tiktok': 'TikTok',
    'nav.instagram': 'Instagram',
    'nav.facebook': 'Facebook',
    'nav.reddit': 'Reddit',
    'nav.tools': 'Strumenti',
    'nav.guides': 'Guide',
    'nav.downloadApp': 'Scarica App',
    'hero.badge': 'RISOLUTORE MULTIMEDIALE VELOCE E PULITO',
    'hero.h1': 'Downloader Video Online',
    'hero.mainHeading': 'Scarica Video Online Gratis',
    'hero.desc': 'Incolla un URL video supportato qui sotto per verificare i formati e le qualità disponibili.',
    'input.placeholder': 'Incolla il link del video qui (es. https://www.youtube.com/watch?v=...)',
    'input.fetch': 'Trova Video',
    'input.resolving': 'Analisi in corso...',
    'input.clear': 'Cancella',
    'input.paste': 'Incolla',
    'input.sample': 'Prova link di esempio',
    'formats.title': 'Formati Disponibili per il Download',
    'formats.videoTab': 'Video (MP4)',
    'formats.audioTab': 'Audio (MP3 / M4A)',
    'formats.quality': 'Qualità / Risoluzione',
    'formats.size': 'Dimensione',
    'formats.format': 'Formato',
    'formats.action': 'Azione',
    'formats.download': 'Scarica',
    'formats.processing': 'Elaborazione...',
    'formats.ready': 'Salva su PC',
    'footer.disclaimer': 'Servizio indipendente: VidLoader non è affiliato a YouTube, TikTok, Instagram, Facebook o Reddit.',
  },
  id: {
    'nav.home': 'Pengunduh Video',
    'nav.youtube': 'YouTube',
    'nav.tiktok': 'TikTok',
    'nav.instagram': 'Instagram',
    'nav.facebook': 'Facebook',
    'nav.reddit': 'Reddit',
    'nav.tools': 'Alat',
    'nav.guides': 'Panduan',
    'nav.downloadApp': 'Unduh Aplikasi',
    'hero.badge': 'PENGOLAH MEDIA CEPAT & BERSIH',
    'hero.h1': 'Pengunduh Video Online',
    'hero.mainHeading': 'Unduh Video Online Gratis',
    'hero.desc': 'Tempel tautan video yang didukung di bawah untuk memeriksa opsi media dan format unduhan.',
    'input.placeholder': 'Tempel tautan video di sini (contoh: https://www.youtube.com/watch?v=...)',
    'input.fetch': 'Ambil Video',
    'input.resolving': 'Menganalisis Media...',
    'input.clear': 'Hapus',
    'input.paste': 'Tempel',
    'input.sample': 'Coba tautan sampel',
    'formats.title': 'Format Unduhan Tersedia',
    'formats.videoTab': 'Video (MP4)',
    'formats.audioTab': 'Audio (MP3 / M4A)',
    'formats.quality': 'Kualitas / Resolusi',
    'formats.size': 'Ukuran File',
    'formats.format': 'Format',
    'formats.action': 'Aksi',
    'formats.download': 'Unduh',
    'formats.processing': 'Memproses...',
    'formats.ready': 'Simpan ke PC',
    'footer.disclaimer': 'Layanan Independen: VidLoader tidak berafiliasi dengan YouTube, TikTok, Instagram, Facebook, atau Reddit.',
  },
  ja: {
    'nav.home': '動画ダウンローダー',
    'nav.youtube': 'YouTube',
    'nav.tiktok': 'TikTok',
    'nav.instagram': 'Instagram',
    'nav.facebook': 'Facebook',
    'nav.reddit': 'Reddit',
    'nav.tools': 'ツール',
    'nav.guides': 'ガイド',
    'nav.downloadApp': 'アプリをダウンロード',
    'hero.badge': '高速でクリーンなメディアリゾルバー',
    'hero.h1': 'オンライン動画ダウンローダー',
    'hero.mainHeading': '動画をオンラインで無料保存',
    'hero.desc': 'サポートされている動画URLを貼り付けて、利用可能な形式と品質を確認してください。',
    'input.placeholder': '動画リンクをここに貼り付け (例: https://www.youtube.com/watch?v=...)',
    'input.fetch': '動画を取得',
    'input.resolving': '解析中...',
    'input.clear': 'クリア',
    'input.paste': '貼り付け',
    'input.sample': 'サンプルリンクで試す',
    'formats.title': 'ダウンロード可能な形式',
    'formats.videoTab': '動画 (MP4)',
    'formats.audioTab': '音声 (MP3 / M4A)',
    'formats.quality': '品質 / 解像度',
    'formats.size': 'サイズ',
    'formats.format': '形式',
    'formats.action': '操作',
    'formats.download': 'ダウンロード',
    'formats.processing': '処理中...',
    'formats.ready': 'PCに保存',
    'footer.disclaimer': '独立したサービス：VidLoaderはYouTube、TikTok、Instagram、Facebook、Redditと提携していません。',
  },
  ru: {
    'nav.home': 'Загрузчик видео',
    'nav.youtube': 'YouTube',
    'nav.tiktok': 'TikTok',
    'nav.instagram': 'Instagram',
    'nav.facebook': 'Facebook',
    'nav.reddit': 'Reddit',
    'nav.tools': 'Инструменты',
    'nav.guides': 'Руководства',
    'nav.downloadApp': 'Скачать приложение',
    'hero.badge': 'БЫСТРЫЙ И БЕЗОПАСНЫЙ ЗАГРУЗЧИК',
    'hero.h1': 'Онлайн Загрузчик Видео',
    'hero.mainHeading': 'Скачать видео онлайн бесплатно',
    'hero.desc': 'Вставьте ссылку на поддерживаемое видео ниже, чтобы выбрать форматы и качество скачивания.',
    'input.placeholder': 'Вставьте ссылку на видео (напр. https://www.youtube.com/watch?v=...)',
    'input.fetch': 'Найти видео',
    'input.resolving': 'Анализ ссылки...',
    'input.clear': 'Очистить',
    'input.paste': 'Вставить',
    'input.sample': 'Тестовая ссылка',
    'formats.title': 'Доступные форматы для скачивания',
    'formats.videoTab': 'Видео (MP4)',
    'formats.audioTab': 'Аудио (MP3 / M4A)',
    'formats.quality': 'Качество / Разрешение',
    'formats.size': 'Размер',
    'formats.format': 'Формат',
    'formats.action': 'Действие',
    'formats.download': 'Скачать',
    'formats.processing': 'Обработка...',
    'formats.ready': 'Сохранить на ПК',
    'footer.disclaimer': 'Независимый сервис: VidLoader не связан с YouTube, TikTok, Instagram, Facebook или Reddit.',
  },
  hi: {
    'nav.home': 'वीडियो डाउनलोडर',
    'nav.youtube': 'YouTube',
    'nav.tiktok': 'TikTok',
    'nav.instagram': 'Instagram',
    'nav.facebook': 'Facebook',
    'nav.reddit': 'Reddit',
    'nav.tools': 'उपकरण',
    'nav.guides': 'गाइड',
    'nav.downloadApp': 'ऐप डाउनलोड करें',
    'hero.badge': 'तेज़ और साफ़ मीडिया रिज़ॉल्वर',
    'hero.h1': 'ऑनलाइन वीडियो डाउनलोडर',
    'hero.mainHeading': 'ऑनलाइन मुफ्त में वीडियो डाउनलोड करें',
    'hero.desc': 'उपलब्ध मीडिया विकल्प और डाउनलोड प्रारूप देखने के लिए नीचे समर्थित वीडियो लिंक चिपकाएं।',
    'input.placeholder': 'वीडियो लिंक यहाँ चिपकाएँ (उदा. https://www.youtube.com/watch?v=...)',
    'input.fetch': 'वीडियो प्राप्त करें',
    'input.resolving': 'विश्लेषण जारी है...',
    'input.clear': 'साफ़ करें',
    'input.paste': 'चिपकाएं',
    'input.sample': 'नमूना लिंक आज़माएं',
    'formats.title': 'उपलब्ध डाउनलोड प्रारूप',
    'formats.videoTab': 'वीडियो (MP4)',
    'formats.audioTab': 'ऑडियो (MP3 / M4A)',
    'formats.quality': 'गुणवत्ता / रिज़ॉल्यूशन',
    'formats.size': 'आकार',
    'formats.format': 'प्रारूप',
    'formats.action': 'कार्रवाई',
    'formats.download': 'डाउनलोड करें',
    'formats.processing': 'प्रसंस्करण जारी है...',
    'formats.ready': 'पीसी में सहेजें',
    'footer.disclaimer': 'स्वतंत्र सेवा: VidLoader का YouTube, TikTok, Instagram, Facebook या Reddit से कोई संबंध नहीं है।',
  },
  ar: {
    'nav.home': 'محمل الفيديو',
    'nav.youtube': 'يوتيوب',
    'nav.tiktok': 'تيك توك',
    'nav.instagram': 'إنستغرام',
    'nav.facebook': 'فيسبوك',
    'nav.reddit': 'ريديت',
    'nav.tools': 'أدوات',
    'nav.guides': 'أدلة',
    'nav.downloadApp': 'تنزيل التطبيق',
    'hero.badge': 'أداة سريعة وآمنة لتحميل الوسائط',
    'hero.h1': 'محمل الفيديو عبر الإنترنت',
    'hero.mainHeading': 'تحميل مقاطع الفيديو مجاناً عبر الإنترنت',
    'hero.desc': 'الصق رابط الفيديو المدعوم أدناه لمعاينة خيارات التنزيل والجودات المتاحة.',
    'input.placeholder': 'الصق رابط الفيديو هنا (مثال: https://www.youtube.com/watch?v=...)',
    'input.fetch': 'جلب الفيديو',
    'input.resolving': 'جارٍ فحص الرابط...',
    'input.clear': 'مسح',
    'input.paste': 'لصق',
    'input.sample': 'تجربة رابط تجريبي',
    'formats.title': 'صيغ التحميل المتاحة',
    'formats.videoTab': 'فيديو (MP4)',
    'formats.audioTab': 'صوت (MP3 / M4A)',
    'formats.quality': 'الجودة / الدقة',
    'formats.size': 'الحجم',
    'formats.format': 'الصيغة',
    'formats.action': 'الإجراء',
    'formats.download': 'تنزيل',
    'formats.processing': 'جارٍ المعالجة...',
    'formats.ready': 'حفظ على الحاسوب',
    'footer.disclaimer': 'خدمة مستقلة: VidLoader غير تابع لـ YouTube أو TikTok أو Instagram أو Facebook أو Reddit.',
  },
  'zh-CN': {
    'nav.home': '视频下载器',
    'nav.youtube': 'YouTube',
    'nav.tiktok': 'TikTok',
    'nav.instagram': 'Instagram',
    'nav.facebook': 'Facebook',
    'nav.reddit': 'Reddit',
    'nav.tools': '转换工具',
    'nav.guides': '下载指南',
    'nav.downloadApp': '下载客户端',
    'hero.badge': '快速且纯净的在线媒体解析器',
    'hero.h1': '在线视频下载器',
    'hero.mainHeading': '免费在线下载超清视频与音频',
    'hero.desc': '在下方粘贴支持的视频链接，即可快速解析并选择可用下载格式与画质。',
    'input.placeholder': '在此粘贴视频链接 (例如: https://www.youtube.com/watch?v=...)',
    'input.fetch': '获取视频',
    'input.resolving': '正在解析媒体...',
    'input.clear': '清除',
    'input.paste': '粘贴',
    'input.sample': '测试示例视频',
    'formats.title': '可用下载格式',
    'formats.videoTab': '视频 (MP4)',
    'formats.audioTab': '音频 (MP3 / M4A)',
    'formats.quality': '画质 / 分辨率',
    'formats.size': '文件大小',
    'formats.format': '格式',
    'formats.action': '操作',
    'formats.download': '下载',
    'formats.processing': '正在转换处理...',
    'formats.ready': '保存到电脑',
    'footer.disclaimer': '独立服务：VidLoader 与 YouTube、TikTok、Instagram、Facebook 或 Reddit 没有任何关联。',
  },
  tr: {
    'nav.home': 'Video İndirici',
    'nav.youtube': 'YouTube',
    'nav.tiktok': 'TikTok',
    'nav.instagram': 'Instagram',
    'nav.facebook': 'Facebook',
    'nav.reddit': 'Reddit',
    'nav.tools': 'Araçlar',
    'nav.guides': 'Rehberler',
    'nav.downloadApp': 'Uygulamayı İndir',
    'hero.badge': 'HIZLI & TEMİZ MEDYA ÇÖZÜCÜ',
    'hero.h1': 'Çevrimiçi Video İndirici',
    'hero.mainHeading': 'Çevrimiçi Ücretsiz Video İndir',
    'hero.desc': 'Mevcut indirme formatlarını ve kaliteleri görüntülemek için desteklenen bir video bağlantısını yapıştırın.',
    'input.placeholder': 'Video bağlantısını buraya yapıştırın (örn. https://www.youtube.com/watch?v=...)',
    'input.fetch': 'Videoyu Getir',
    'input.resolving': 'Bağlantı Çözümleniyor...',
    'input.clear': 'Temizle',
    'input.paste': 'Yapıştır',
    'input.sample': 'Örnek bağlantıyı dene',
    'formats.title': 'Kullanılabilir İndirme Formatları',
    'formats.videoTab': 'Video (MP4)',
    'formats.audioTab': 'Ses (MP3 / M4A)',
    'formats.quality': 'Kalite / Çözünürlük',
    'formats.size': 'Boyut',
    'formats.format': 'Format',
    'formats.action': 'İşlem',
    'formats.download': 'İndir',
    'formats.processing': 'İşleniyor...',
    'formats.ready': 'Bilgisayara Kaydet',
    'footer.disclaimer': 'Bağımsız Hizmet: VidLoader; YouTube, TikTok, Instagram, Facebook veya Reddit ile ilişkili değildir.',
  },
};

const LanguageContext = createContext({
  currentLanguage: 'en',
  changeLanguage: () => {},
  t: (key, fallback) => fallback || key,
  languages: AVAILABLE_LANGUAGES,
  isTranslating: false,
});

/**
 * Triggers the Google Translate engine on the entire document DOM
 */
function applyGoogleTranslation(targetLang) {
  if (typeof window === 'undefined') return;

  const normalized = targetLang.toLowerCase();

  // 1. Manage googtrans cookies for document and domains
  const cookieValue = normalized === 'en' ? '' : `/en/${normalized}`;
  const expires = normalized === 'en' ? 'Thu, 01 Jan 1970 00:00:00 GMT' : 'Fri, 31 Dec 9999 23:59:59 GMT';

  document.cookie = `googtrans=${cookieValue}; path=/; expires=${expires}`;
  if (window.location.hostname && window.location.hostname !== 'localhost') {
    document.cookie = `googtrans=${cookieValue}; domain=.${window.location.hostname}; path=/; expires=${expires}`;
  }

  // 2. Set document HTML language and direction
  document.documentElement.lang = targetLang;
  document.documentElement.dir = targetLang === 'ar' ? 'rtl' : 'ltr';

  // 3. Trigger Google Translate combo element if available
  const triggerCombo = () => {
    const combo = document.querySelector('.goog-te-combo');
    if (combo) {
      if (normalized === 'en') {
        combo.value = '';
      } else {
        combo.value = normalized;
      }
      combo.dispatchEvent(new Event('change'));
      return true;
    }
    return false;
  };

  if (!triggerCombo()) {
    // If element is still loading, retry after brief intervals
    const intervals = [100, 300, 700, 1500];
    intervals.forEach((delay) => {
      setTimeout(() => {
        triggerCombo();
      }, delay);
    });
  }
}

export function LanguageProvider({ children }) {
  const { path } = useRouter();
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('vidloader_preferred_language');
      if (saved && AVAILABLE_LANGUAGES.some((l) => l.code.toLowerCase() === saved.toLowerCase())) {
        return saved;
      }
      // Check googtrans cookie if set
      const match = document.cookie.match(/googtrans=\/en\/([a-zA-Z-]+)/);
      if (match && match[1]) {
        return match[1];
      }
    }
    return 'en';
  });

  const [isTranslating, setIsTranslating] = useState(false);
  const initialMount = useRef(true);

  // Apply Google Translate on language change
  const changeLanguage = useCallback((langCode) => {
    const target = langCode || 'en';
    setCurrentLanguage(target);

    if (typeof window !== 'undefined') {
      localStorage.setItem('vidloader_preferred_language', target);
      setIsTranslating(true);
      applyGoogleTranslation(target);

      setTimeout(() => {
        setIsTranslating(false);
      }, 600);
    }
  }, []);

  // Sync translation on route change so new page content translates automatically
  useEffect(() => {
    if (initialMount.current) {
      initialMount.current = false;
      if (currentLanguage && currentLanguage !== 'en') {
        applyGoogleTranslation(currentLanguage);
      }
      return;
    }

    if (currentLanguage && currentLanguage !== 'en') {
      const timer = setTimeout(() => {
        applyGoogleTranslation(currentLanguage);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [path, currentLanguage]);

  // Translate function with fallbacks
  const t = useCallback(
    (key, fallback = '') => {
      const langDict = UI_TRANSLATIONS[currentLanguage] || UI_TRANSLATIONS['en'];
      if (langDict && langDict[key]) {
        return langDict[key];
      }
      const enDict = UI_TRANSLATIONS['en'];
      if (enDict && enDict[key]) {
        return enDict[key];
      }
      return fallback || key;
    },
    [currentLanguage]
  );

  return (
    <LanguageContext.Provider
      value={{
        currentLanguage,
        changeLanguage,
        t,
        languages: AVAILABLE_LANGUAGES,
        isTranslating,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
