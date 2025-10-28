// Translation Service for managing dynamic translations
export interface TranslationData {
  en: string;
  ar: string;
}

export interface TranslationCategory {
  title: string;
  keys: string[];
}

export const TRANSLATION_CATEGORIES: Record<string, TranslationCategory> = {
  general: {
    title: 'General',
    keys: [
      'appTitle', 'managementSystem', 'dashboard', 'users', 'events', 'parties',
      'settings', 'logout', 'login', 'register', 'save', 'cancel', 'edit', 'delete',
      'add', 'create', 'update', 'view', 'search', 'filter', 'export', 'import',
      'download', 'upload', 'share', 'close', 'confirm', 'back', 'next', 'previous'
    ]
  },
  navigation: {
    title: 'Navigation',
    keys: [
      'userManagement', 'eventManagement', 'parties', 'languageSettings',
      'overviewAndStatistics', 'manageUsersAndPermissions', 'createAndManageEvents',
      'viewEventParticipants', 'customizeTranslationValues'
    ]
  },
  forms: {
    title: 'Forms & Inputs',
    keys: [
      'fullName', 'username', 'password', 'role', 'admin', 'participant', 'coordinator',
      'permissions', 'day', 'date', 'time', 'duration', 'place', 'participants',
      'meetingDate', 'meetingTime', 'meetingPlace', 'participationType', 'eventPurpose',
      'pants', 'shirt', 'coat', 'shoes', 'whip', 'socks', 'accessories'
    ]
  },
  status: {
    title: 'Status & Actions',
    keys: [
      'pending', 'confirmed', 'completed', 'cancelled', 'actions', 'created', 'updated',
      'status', 'readyToProceed', 'awaitingConfirmation', 'noPermissions'
    ]
  },
  events: {
    title: 'Events',
    keys: [
      'eventsList', 'allEventsInSystem', 'shown', 'nearestEvents', 'exportExcel',
      'showFilters', 'addNewEvent', 'shareEvents', 'sortBy', 'selectSortOption',
      'totalEvents', 'eventStatusOverview', 'currentStatusDistribution'
    ]
  },
  users: {
    title: 'Users',
    keys: [
      'systemUsers', 'allRegisteredUsers', 'createNewUserAccount', 'specificPagePermissions',
      'addUser', 'editUser', 'deleteUser', 'addNewUser'
    ]
  },
  dashboard: {
    title: 'Dashboard',
    keys: [
      'noUpcomingParties', 'noPartiesScheduled', 'noPartiesDescription', 'allPartiesInSystem',
      'registeredSystemUsers', 'eventPurpose', 'meetingDetails'
    ]
  }
};

// Default English translations
export const DEFAULT_ENGLISH_TRANSLATIONS: Record<string, string> = {
  appTitle: 'Ayat Events',
  managementSystem: 'Management System',
  dashboard: 'Dashboard',
  users: 'Users',
  events: 'Events',
  parties: 'Parties',
  settings: 'Settings',
  languageSettings: 'Language Settings',
  logout: 'Logout',
  login: 'Login',
  register: 'Register',
  save: 'Save',
  cancel: 'Cancel',
  edit: 'Edit',
  delete: 'Delete',
  add: 'Add',
  create: 'Create',
  update: 'Update',
  view: 'View',
  search: 'Search',
  filter: 'Filter',
  export: 'Export',
  import: 'Import',
  download: 'Download',
  upload: 'Upload',
  share: 'Share',
  close: 'Close',
  confirm: 'Confirm',
  back: 'Back',
  next: 'Next',
  previous: 'Previous',
  userManagement: 'User Management',
  eventManagement: 'Event Management',
  overviewAndStatistics: 'Overview and statistics',
  manageUsersAndPermissions: 'Manage users and permissions',
  createAndManageEvents: 'Create and manage events',
  viewEventParticipants: 'View event participants',
  customizeTranslationValues: 'Customize translation values',
  fullName: 'Full Name',
  username: 'Username',
  password: 'Password',
  role: 'Role',
  admin: 'Admin',
  participant: 'Participant',
  coordinator: 'Coordinator',
  permissions: 'Permissions',
  day: 'Day',
  date: 'Date',
  time: 'Time',
  duration: 'Duration',
  place: 'Place',
  participants: 'Participants',
  meetingDate: 'Meeting Date',
  meetingTime: 'Meeting Time',
  meetingPlace: 'Meeting Place',
  participationType: 'Participation Type',
  eventPurpose: 'Event Purpose',
  pants: 'Pants',
  shirt: 'Shirt',
  coat: 'Coat',
  shoes: 'Shoes',
  whip: 'Whip',
  socks: 'Socks',
  accessories: 'Accessories',
  pending: 'Pending',
  confirmed: 'Confirmed',
  completed: 'Completed',
  cancelled: 'Cancelled',
  actions: 'Actions',
  created: 'Created',
  updated: 'Updated',
  status: 'Status',
  readyToProceed: 'Ready to proceed',
  awaitingConfirmation: 'Awaiting confirmation',
  noPermissions: 'No permissions',
  eventsList: 'Events List',
  allEventsInSystem: 'All events in the system',
  shown: 'shown',
  nearestEvents: 'Nearest Events',
  exportExcel: 'Export Excel',
  showFilters: 'Show Filters',
  addNewEvent: 'Add New Event',
  shareEvents: 'Share Events',
  sortBy: 'Sort by:',
  selectSortOption: 'Select sort option',
  totalEvents: 'total events',
  eventStatusOverview: 'Event Status Overview',
  currentStatusDistribution: 'Current status distribution of all events',
  systemUsers: 'System Users',
  allRegisteredUsers: 'All registered users in the system',
  createNewUserAccount: 'Create a new user account with specific page permissions',
  specificPagePermissions: 'specific page permissions',
  addUser: 'Add User',
  editUser: 'Edit User',
  deleteUser: 'Delete User',
  addNewUser: 'Add New User',
  noUpcomingParties: 'No Upcoming Parties',
  noPartiesScheduled: 'No Parties Scheduled',
  noPartiesDescription: 'There are currently no confirmed parties scheduled. Check back later or create a new event.',
  allPartiesInSystem: 'All parties in the system',
  registeredSystemUsers: 'Registered system users',
  eventPurpose: 'Event Purpose',
  meetingDetails: 'Meeting Details'
};

// Default Arabic translations
export const DEFAULT_ARABIC_TRANSLATIONS: Record<string, string> = {
  appTitle: 'أحداث الآيات',
  managementSystem: 'نظام الإدارة',
  dashboard: 'لوحة التحكم',
  users: 'المستخدمون',
  events: 'الأحداث',
  parties: 'الحفلات',
  settings: 'الإعدادات',
  languageSettings: 'إعدادات اللغة',
  logout: 'تسجيل الخروج',
  login: 'تسجيل الدخول',
  register: 'التسجيل',
  save: 'حفظ',
  cancel: 'إلغاء',
  edit: 'تعديل',
  delete: 'حذف',
  add: 'إضافة',
  create: 'إنشاء',
  update: 'تحديث',
  view: 'عرض',
  search: 'بحث',
  filter: 'تصفية',
  export: 'تصدير',
  import: 'استيراد',
  download: 'تحميل',
  upload: 'رفع',
  share: 'مشاركة',
  close: 'إغلاق',
  confirm: 'تأكيد',
  back: 'رجوع',
  next: 'التالي',
  previous: 'السابق',
  userManagement: 'إدارة المستخدمين',
  eventManagement: 'إدارة الأحداث',
  overviewAndStatistics: 'نظرة عامة وإحصائيات',
  manageUsersAndPermissions: 'إدارة المستخدمين والأذونات',
  createAndManageEvents: 'إنشاء وإدارة الأحداث',
  viewEventParticipants: 'عرض مشاركي الأحداث',
  customizeTranslationValues: 'تخصيص قيم الترجمة',
  fullName: 'الاسم الكامل',
  username: 'اسم المستخدم',
  password: 'كلمة المرور',
  role: 'الدور',
  admin: 'مدير',
  participant: 'مشارك',
  coordinator: 'منسق',
  permissions: 'الأذونات',
  day: 'اليوم',
  date: 'التاريخ',
  time: 'الوقت',
  duration: 'المدة',
  place: 'المكان',
  participants: 'المشاركون',
  meetingDate: 'تاريخ الاجتماع',
  meetingTime: 'وقت الاجتماع',
  meetingPlace: 'مكان الاجتماع',
  participationType: 'نوع المشاركة',
  eventPurpose: 'غرض الحدث',
  pants: 'بنطلون',
  shirt: 'قميص',
  coat: 'معطف',
  shoes: 'حذاء',
  whip: 'قشاط',
  socks: 'جوارب',
  accessories: 'اكسسوارات',
  pending: 'في الانتظار',
  confirmed: 'مؤكد',
  completed: 'مكتمل',
  cancelled: 'ملغي',
  actions: 'الإجراءات',
  created: 'تم الإنشاء',
  updated: 'تم التحديث',
  status: 'الحالة',
  readyToProceed: 'جاهز للمتابعة',
  awaitingConfirmation: 'في انتظار التأكيد',
  noPermissions: 'لا توجد أذونات',
  eventsList: 'قائمة الأحداث',
  allEventsInSystem: 'جميع الأحداث في النظام',
  shown: 'معروض',
  nearestEvents: 'الأحداث الأقرب',
  exportExcel: 'تصدير إكسل',
  showFilters: 'إظهار المرشحات',
  addNewEvent: 'إضافة حدث جديد',
  shareEvents: 'مشاركة الأحداث',
  sortBy: 'ترتيب حسب:',
  selectSortOption: 'اختر خيار الترتيب',
  totalEvents: 'إجمالي الأحداث',
  eventStatusOverview: 'نظرة عامة على حالة الأحداث',
  currentStatusDistribution: 'التوزيع الحالي لحالة جميع الأحداث',
  systemUsers: 'مستخدمو النظام',
  allRegisteredUsers: 'جميع المستخدمين المسجلين في النظام',
  createNewUserAccount: 'إنشاء حساب مستخدم جديد مع أذونات صفحات محددة',
  specificPagePermissions: 'أذونات صفحات محددة',
  addUser: 'إضافة مستخدم',
  editUser: 'تعديل المستخدم',
  deleteUser: 'حذف المستخدم',
  addNewUser: 'إضافة مستخدم جديد',
  noUpcomingParties: 'لا توجد حفلات قادمة',
  noPartiesScheduled: 'لا توجد حفلات مجدولة',
  noPartiesDescription: 'لا توجد حالياً حفلات مؤكدة مجدولة. تحقق مرة أخرى لاحقاً أو أنشئ حدثاً جديداً.',
  allPartiesInSystem: 'جميع الحفلات في النظام',
  registeredSystemUsers: 'مستخدمون مسجلون في النظام',
  eventPurpose: 'غرض الحدث',
  meetingDetails: 'تفاصيل الاجتماع'
};

class TranslationService {
  private translations: Record<string, TranslationData> = {};
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.loadTranslations();
  }

  // Load translations from localStorage or initialize with defaults
  private loadTranslations() {
    const stored = localStorage.getItem('customTranslations');
    if (stored) {
      try {
        this.translations = JSON.parse(stored);
      } catch (error) {
        console.error('Failed to load custom translations:', error);
        this.initializeDefaultTranslations();
      }
    } else {
      this.initializeDefaultTranslations();
    }
  }

  // Initialize with default translations
  private initializeDefaultTranslations() {
    this.translations = {};
    Object.keys(DEFAULT_ENGLISH_TRANSLATIONS).forEach(key => {
      this.translations[key] = {
        en: DEFAULT_ENGLISH_TRANSLATIONS[key],
        ar: DEFAULT_ARABIC_TRANSLATIONS[key] || DEFAULT_ENGLISH_TRANSLATIONS[key]
      };
    });
    this.saveTranslations();
  }

  // Save translations to localStorage
  private saveTranslations() {
    localStorage.setItem('customTranslations', JSON.stringify(this.translations));
    this.notifyListeners();
  }

  // Notify all listeners of changes
  private notifyListeners() {
    this.listeners.forEach(listener => listener());
  }

  // Subscribe to translation changes
  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  // Get translation for a key
  getTranslation(key: string, language: 'en' | 'ar'): string {
    const translation = this.translations[key];
    if (translation) {
      return translation[language] || translation.en || key;
    }
    return DEFAULT_ENGLISH_TRANSLATIONS[key] || key;
  }

  // Get all translations
  getAllTranslations(): Record<string, TranslationData> {
    return { ...this.translations };
  }

  // Update a translation
  updateTranslation(key: string, en: string, ar: string) {
    this.translations[key] = { en, ar };
    this.saveTranslations();
  }

  // Update multiple translations
  updateTranslations(updates: Record<string, TranslationData>) {
    Object.entries(updates).forEach(([key, translation]) => {
      this.translations[key] = translation;
    });
    this.saveTranslations();
  }

  // Reset to default translations
  resetToDefaults() {
    this.initializeDefaultTranslations();
  }

  // Export translations
  exportTranslations(): string {
    return JSON.stringify(this.translations, null, 2);
  }

  // Import translations
  importTranslations(jsonData: string) {
    try {
      const imported = JSON.parse(jsonData);
      this.translations = imported;
      this.saveTranslations();
      return true;
    } catch (error) {
      console.error('Failed to import translations:', error);
      return false;
    }
  }
}

// Create singleton instance
export const translationService = new TranslationService();
