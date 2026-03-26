export type TranslationKey = 
  | 'app_name'
  | 'app_description'
  | 'summarize_button'
  | 'paste_url_placeholder'
  | 'neural_extraction_complete'
  | 'neural_link_active'
  | 'history_title'
  | 'clear_all'
  | 'search_placeholder'
  | 'no_history'
  | 'load_button'
  | 'drop_zone_text'
  | 'drop_zone_subtext'
  | 'release_to_extract'
  | 'initializing'
  | 'connecting'
  | 'analyzing'
  | 'decoding'
  | 'mapping'
  | 'synthesizing'
  | 'validating'
  | 'finalizing'
  | 'output_format'
  | 'summary_length'
  | 'ai_persona'
  | 'output_language'
  | 'export_analysis'
  | 'neural_bridge'
  | 'prompt_copied'
  | 'copied'
  | 'settings_title'
  | 'appearance'
  | 'theme'
  | 'accent_color'
  | 'extraction_settings'
  | 'max_summary_length'
  | 'auto_copy'
  | 'save_settings'
  | 'ui_language'
  | 'back_to_main'
  | 'settings_subtitle'
  | 'defaults_section'
  | 'default_output_format'
  | 'default_language'
  | 'behavior_section'
  | 'auto_send_prompt'
  | 'auto_send_subtext'
  | 'show_floating_pill'
  | 'show_pill_subtext'
  | 'extraction_limits'
  | 'max_input_length'
  | 'summary_length_subtext'
  | 'appearance_section'
  | 'color_mode'
  | 'active_platforms'
  | 'reset_defaults'
  | 'privacy_note'
  | 'built_with_love'
  | 'dyslexia_font'
  | 'dyslexia_font_subtext'
  | 'save_to_device'
  | 'api_config_section'
  | 'gemini_api_key'
  | 'ocr_button'
  | 'record_button'
  | 'stop_button'
  | 'full_transcript'
  | 'voice_search';

export const TRANSLATIONS: Record<string, Record<TranslationKey, string>> = {
  English: {
    app_name: 'Aristotle 26',
    app_description: 'Universal AI Summarizer',
    summarize_button: 'SUMMARIZE',
    paste_url_placeholder: 'Paste URL here to summarize...',
    neural_extraction_complete: 'Neural Extraction Complete',
    neural_link_active: 'Neural Link Active',
    history_title: 'Recent Extractions',
    clear_all: 'Clear All',
    search_placeholder: 'Search by title, URL or content...',
    no_history: 'No neural traces found.',
    load_button: 'Load',
    drop_zone_text: 'Drop File or Paste URL',
    drop_zone_subtext: 'Supports PDF, TXT, DOCX & Web URLs',
    release_to_extract: 'Release to Extract',
    initializing: 'Initializing',
    connecting: 'Connecting',
    analyzing: 'Analyzing',
    decoding: 'Decoding',
    mapping: 'Mapping',
    synthesizing: 'Synthesizing',
    validating: 'Validating',
    finalizing: 'Finalizing',
    output_format: 'Output Format',
    summary_length: 'Summary Length',
    ai_persona: 'AI Persona',
    output_language: 'Output Language',
    export_analysis: 'Export Analysis',
    neural_bridge: 'Neural Bridge',
    prompt_copied: 'Prompt auto-copied to clipboard',
    copied: 'Copied!',
    settings_title: 'System Configuration',
    appearance: 'Appearance',
    theme: 'Theme',
    accent_color: 'Accent Color',
    extraction_settings: 'Extraction Settings',
    max_summary_length: 'Max Summary Length',
    auto_copy: 'Auto-copy to clipboard',
    save_settings: 'Save Configuration',
    ui_language: 'UI Language',
    back_to_main: 'Back to Main',
    settings_subtitle: 'Customize how you extract and summarize content',
    defaults_section: 'Defaults',
    default_output_format: 'Default Output Format',
    default_language: 'Default Language',
    behavior_section: 'Behavior',
    auto_send_prompt: 'Auto-send Prompt',
    auto_send_subtext: 'Automatically submits the form on the AI site',
    show_floating_pill: 'Show Floating Pill',
    show_pill_subtext: 'Enable "Summarize" button on every page',
    extraction_limits: 'Extraction Limits',
    max_input_length: 'Max Input Length (chars)',
    summary_length_subtext: 'This instructs the AI to keep the response within this character limit.',
    appearance_section: 'Appearance',
    color_mode: 'Color Mode',
    active_platforms: 'Active Platforms',
    reset_defaults: 'Reset Defaults',
    privacy_note: 'Aristotle 26 uses local storage only. Your data is your own.',
    built_with_love: 'Built with ❤️ for AI Enthusiasts',
    dyslexia_font: 'Dyslexia Friendly Font',
    dyslexia_font_subtext: 'Use a font designed to be easier to read for people with dyslexia',
    save_to_device: 'Save to Device',
    api_config_section: 'API Configuration',
    gemini_api_key: 'Gemini API Key',
    ocr_button: 'OCR',
    record_button: 'Record',
    stop_button: 'Stop',
    full_transcript: 'Full Transcript',
    voice_search: 'Voice Search'
  },
  Japanese: {
    app_name: 'Aristotle 26',
    app_description: 'ユニバーサルAI要約',
    summarize_button: '要約する',
    paste_url_placeholder: 'ここにURLを貼り付けて要約...',
    neural_extraction_complete: 'ニューラル抽出完了',
    neural_link_active: 'ニューラルリンク有効',
    history_title: '最近の抽出',
    clear_all: 'すべて削除',
    search_placeholder: 'タイトル、URL、内容で検索...',
    no_history: '履歴が見つかりません。',
    load_button: '読み込む',
    drop_zone_text: 'ファイルをドロップまたはURLを貼り付け',
    drop_zone_subtext: 'PDF、TXT、DOCX、Web URLに対応',
    release_to_extract: '離して抽出開始',
    initializing: '初期化中',
    connecting: '接続中',
    analyzing: '分析中',
    decoding: 'デコード中',
    mapping: 'マッピング中',
    synthesizing: '統合中',
    validating: '検証中',
    finalizing: '最終処理中',
    output_format: '出力形式',
    summary_length: '要約の長さ',
    ai_persona: 'AIペルソナ',
    output_language: '出力言語',
    export_analysis: '分析をエクスポート',
    neural_bridge: 'ニューラルブリッジ',
    prompt_copied: 'プロンプトをクリップボードに自動コピーしました',
    copied: 'コピー完了！',
    settings_title: 'システム設定',
    appearance: '外観',
    theme: 'テーマ',
    accent_color: 'アクセントカラー',
    extraction_settings: '抽出設定',
    max_summary_length: '最大要約長',
    auto_copy: 'クリップボードに自動コピー',
    save_settings: '設定を保存',
    ui_language: 'UI言語',
    back_to_main: 'メインに戻る',
    settings_subtitle: '抽出と要約のカスタマイズ',
    defaults_section: 'デフォルト設定',
    default_output_format: 'デフォルト出力形式',
    default_language: 'デフォルト言語',
    behavior_section: '動作設定',
    auto_send_prompt: 'プロンプト自動送信',
    auto_send_subtext: 'AIサイトでフォームを自動的に送信します',
    show_floating_pill: 'フローティングボタンを表示',
    show_pill_subtext: 'すべてのページに「要約」ボタンを表示します',
    extraction_limits: '抽出制限',
    max_input_length: '最大入力長（文字数）',
    summary_length_subtext: 'AIにこの文字数制限内で回答するよう指示します。',
    appearance_section: '外観',
    color_mode: 'カラーモード',
    active_platforms: '有効なプラットフォーム',
    reset_defaults: 'デフォルトに戻す',
    privacy_note: 'Aristotle 26はローカルストレージのみを使用します。データはあなたのものです。',
    built_with_love: 'AI愛好家のために❤️を込めて構築',
    dyslexia_font: '失読症に優しいフォント',
    dyslexia_font_subtext: '失読症の方でも読みやすいように設計されたフォントを使用します',
    save_to_device: 'デバイスに保存',
    api_config_section: 'API設定',
    gemini_api_key: 'Gemini APIキー',
    ocr_button: 'OCR',
    record_button: '録音',
    stop_button: '停止',
    full_transcript: '全文書き起こし',
    voice_search: '音声検索'
  },
  Spanish: {
    app_name: 'Aristotle 26',
    app_description: 'Resumidor IA Universal',
    summarize_button: 'RESUMIR',
    paste_url_placeholder: 'Pegue la URL aquí para resumir...',
    neural_extraction_complete: 'Extracción Neural Completada',
    neural_link_active: 'Enlace Neural Activo',
    history_title: 'Extracciones Recientes',
    clear_all: 'Borrar Todo',
    search_placeholder: 'Buscar por título, URL o contenido...',
    no_history: 'No se encontraron rastros neurales.',
    load_button: 'Cargar',
    drop_zone_text: 'Suelte el archivo o pegue la URL',
    drop_zone_subtext: 'Soporta PDF, TXT, DOCX y URLs web',
    release_to_extract: 'Soltar para Extraer',
    initializing: 'Inicializando',
    connecting: 'Conectando',
    analyzing: 'Analizando',
    decoding: 'Decodificando',
    mapping: 'Mapeando',
    synthesizing: 'Sintetizando',
    validating: 'Validando',
    finalizing: 'Finalizando',
    output_format: 'Formato de Salida',
    summary_length: 'Longitud del Resumen',
    ai_persona: 'Persona IA',
    output_language: 'Idioma de Salida',
    export_analysis: 'Exportar Análisis',
    neural_bridge: 'Puente Neural',
    prompt_copied: 'Prompt copiado automáticamente al portapapeles',
    copied: '¡Copiado!',
    settings_title: 'Configuración del Sistema',
    appearance: 'Apariencia',
    theme: 'Tema',
    accent_color: 'Color de Acento',
    extraction_settings: 'Ajustes de Extracción',
    max_summary_length: 'Longitud Máxima',
    auto_copy: 'Copia automática al portapapeles',
    save_settings: 'Guardar Configuración',
    ui_language: 'Idioma de la Interfaz',
    back_to_main: 'Volver al Inicio',
    settings_subtitle: 'Personaliza cómo extraes y resumes el contenido',
    defaults_section: 'Valores Predeterminados',
    default_output_format: 'Formato de Salida Predeterminado',
    default_language: 'Idioma Predeterminado',
    behavior_section: 'Comportamiento',
    auto_send_prompt: 'Enviar Prompt Automáticamente',
    auto_send_subtext: 'Envía automáticamente el formulario en el sitio de IA',
    show_floating_pill: 'Mostrar Botón Flotante',
    show_pill_subtext: 'Habilitar el botón "Resumir" en cada página',
    extraction_limits: 'Límites de Extracción',
    max_input_length: 'Longitud Máxima de Entrada (caracteres)',
    summary_length_subtext: 'Esto indica a la IA que mantenga la respuesta dentro de este límite de caracteres.',
    appearance_section: 'Apariencia',
    color_mode: 'Modo de Color',
    active_platforms: 'Plataformas Activas',
    reset_defaults: 'Restablecer Valores',
    privacy_note: 'Aristotle 26 solo utiliza el almacenamiento local. Tus datos son tuyos.',
    built_with_love: 'Construido con ❤️ para entusiastas de la IA',
    dyslexia_font: 'Fuente para Dislexia',
    dyslexia_font_subtext: 'Usa una fuente diseñada para ser más fácil de leer para personas con dislexia',
    save_to_device: 'Guardar en Dispositivo',
    api_config_section: 'Configuración de API',
    gemini_api_key: 'Clave API de Gemini',
    ocr_button: 'OCR',
    record_button: 'Grabar',
    stop_button: 'Detener',
    full_transcript: 'Transcripción Completa',
    voice_search: 'Búsqueda por Voz'
  },
  French: {
    app_name: 'Aristotle 26',
    app_description: 'Résumé IA Universel',
    summarize_button: 'RÉSUMER',
    paste_url_placeholder: 'Collez l\'URL ici pour résumer...',
    neural_extraction_complete: 'Extraction Neurale Terminée',
    neural_link_active: 'Lien Neural Actif',
    history_title: 'Extractions Récentes',
    clear_all: 'Tout Effacer',
    search_placeholder: 'Rechercher par titre, URL ou contenu...',
    no_history: 'Aucune trace neurale trouvée.',
    load_button: 'Charger',
    drop_zone_text: 'Déposez le fichier ou collez l\'URL',
    drop_zone_subtext: 'Supporte PDF, TXT, DOCX & URLs Web',
    release_to_extract: 'Relâcher pour Extraire',
    initializing: 'Initialisation',
    connecting: 'Connexion',
    analyzing: 'Analyse',
    decoding: 'Décodage',
    mapping: 'Cartographie',
    synthesizing: 'Synthèse',
    validating: 'Validation',
    finalizing: 'Finalisation',
    output_format: 'Format de Sortie',
    summary_length: 'Longueur du Résumé',
    ai_persona: 'Persona IA',
    output_language: 'Langue de Sortie',
    export_analysis: 'Exporter l\'Analyse',
    neural_bridge: 'Pont Neural',
    prompt_copied: 'Prompt copié automatiquement dans le presse-papiers',
    copied: 'Copié !',
    settings_title: 'Configuration Système',
    appearance: 'Apparence',
    theme: 'Thème',
    accent_color: 'Couleur d\'Accent',
    extraction_settings: 'Paramètres d\'Extraction',
    max_summary_length: 'Longueur Max du Résumé',
    auto_copy: 'Copie automatique',
    save_settings: 'Enregistrer la Configuration',
    ui_language: 'Langue de l\'Interface',
    back_to_main: 'Retour',
    settings_subtitle: 'Personnalisez l\'extraction et le résumé du contenu',
    defaults_section: 'Par Défaut',
    default_output_format: 'Format de Sortie par Défaut',
    default_language: 'Langue par Défaut',
    behavior_section: 'Comportement',
    auto_send_prompt: 'Envoi Automatique du Prompt',
    auto_send_subtext: 'Soumet automatiquement le formulaire sur le site de l\'IA',
    show_floating_pill: 'Afficher le Bouton Flottant',
    show_pill_subtext: 'Activer le bouton "Résumer" sur chaque page',
    extraction_limits: 'Limites d\'Extraction',
    max_input_length: 'Longueur Max d\'Entrée (caractères)',
    summary_length_subtext: 'Cela demande à l\'IA de garder la réponse dans cette limite de caractères.',
    appearance_section: 'Apparence',
    color_mode: 'Mode Couleur',
    active_platforms: 'Plateformes Actives',
    reset_defaults: 'Réinitialiser',
    privacy_note: 'Aristotle 26 utilise uniquement le stockage local. Vos données vous appartiennent.',
    built_with_love: 'Construit avec ❤️ pour les passionnés d\'IA',
    dyslexia_font: 'Police pour Dyslexie',
    dyslexia_font_subtext: 'Utiliser une police conçue pour être plus facile à lire pour les personnes dyslexiques',
    save_to_device: 'Enregistrer sur l\'appareil',
    api_config_section: 'Configuration de l\'API',
    gemini_api_key: 'Clé API Gemini',
    ocr_button: 'OCR',
    record_button: 'Enregistrer',
    stop_button: 'Arrêter',
    full_transcript: 'Transcription Complète',
    voice_search: 'Recherche Vocale'
  },
  German: {
    app_name: 'Aristotle 26',
    app_description: 'Universeller KI-Zusammenfasser',
    summarize_button: 'ZUSAMMENFASSEN',
    paste_url_placeholder: 'URL hier einfügen zum Zusammenfassen...',
    neural_extraction_complete: 'Neurale Extraktion Abgeschlossen',
    neural_link_active: 'Neurale Verbindung Aktiv',
    history_title: 'Letzte Extraktionen',
    clear_all: 'Alle Löschen',
    search_placeholder: 'Suche nach Titel, URL oder Inhalt...',
    no_history: 'Keine neuralen Spuren gefunden.',
    load_button: 'Laden',
    drop_zone_text: 'Datei ablegen oder URL einfügen',
    drop_zone_subtext: 'Unterstützt PDF, TXT, DOCX & Web-URLs',
    release_to_extract: 'Loslassen zum Extrahieren',
    initializing: 'Initialisierung',
    connecting: 'Verbindung wird hergestellt',
    analyzing: 'Analyse',
    decoding: 'Dekodierung',
    mapping: 'Mapping',
    synthesizing: 'Synthese',
    validating: 'Validierung',
    finalizing: 'Finalisierung',
    output_format: 'Ausgabeformat',
    summary_length: 'Länge der Zusammenfassung',
    ai_persona: 'KI-Persona',
    output_language: 'Ausgabesprache',
    export_analysis: 'Analyse Exportieren',
    neural_bridge: 'Neurale Brücke',
    prompt_copied: 'Prompt automatisch in die Zwischenablage kopiert',
    copied: 'Kopiert!',
    settings_title: 'Systemkonfiguration',
    appearance: 'Erscheinungsbild',
    theme: 'Thema',
    accent_color: 'Akzentfarbe',
    extraction_settings: 'Extraktionseinstellungen',
    max_summary_length: 'Maximale Länge',
    auto_copy: 'Automatisch kopieren',
    save_settings: 'Konfiguration Speichern',
    ui_language: 'UI-Sprache',
    back_to_main: 'Zurück zum Hauptmenü',
    settings_subtitle: 'Passen Sie die Extraktion und Zusammenfassung an',
    defaults_section: 'Standardwerte',
    default_output_format: 'Standard-Ausgabeformat',
    default_language: 'Standardsprache',
    behavior_section: 'Verhalten',
    auto_send_prompt: 'Prompt automatisch senden',
    auto_send_subtext: 'Sendet das Formular auf der KI-Seite automatisch ab',
    show_floating_pill: 'Schwebende Schaltfläche anzeigen',
    show_pill_subtext: 'Schaltfläche "Zusammenfassen" auf jeder Seite aktivieren',
    extraction_limits: 'Extraktionslimits',
    max_input_length: 'Maximale Eingabelänge (Zeichen)',
    summary_length_subtext: 'Dies weist die KI an, die Antwort innerhalb dieses Zeichenlimits zu halten.',
    appearance_section: 'Erscheinungsbild',
    color_mode: 'Farbmodus',
    active_platforms: 'Aktive Plattformen',
    reset_defaults: 'Standardwerte zurücksetzen',
    privacy_note: 'Aristotle 26 verwendet nur lokalen Speicher. Ihre Daten gehören Ihnen.',
    built_with_love: 'Mit ❤️ für KI-Enthusiasten gebaut',
    dyslexia_font: 'Legastheniker-freundliche Schriftart',
    dyslexia_font_subtext: 'Verwenden Sie eine Schriftart, die für Menschen mit Legasthenie leichter zu lesen ist',
    save_to_device: 'Auf Gerät speichern',
    api_config_section: 'API-Konfiguration',
    gemini_api_key: 'Gemini API-Schlüssel',
    ocr_button: 'OCR',
    record_button: 'Aufnehmen',
    stop_button: 'Stopp',
    full_transcript: 'Vollständiges Transkript',
    voice_search: 'Sprachsuche'
  }
};

export const useTranslation = (lang: string = 'English') => {
  const t = (key: TranslationKey): string => {
    return TRANSLATIONS[lang]?.[key] || TRANSLATIONS['English'][key];
  };
  return { t };
};
