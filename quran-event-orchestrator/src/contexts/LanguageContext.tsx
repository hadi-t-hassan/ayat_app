import React, { createContext, useContext, useEffect, useState } from 'react';
import { translationService } from '@/services/translationService';

// Translation types
interface Translations {
  // Common
  loading: string;
  error: string;
  success: string;
  cancel: string;
  save: string;
  delete: string;
  edit: string;
  add: string;
  search: string;
  filter: string;
  clear: string;
  confirm: string;
  back: string;
  next: string;
  previous: string;
  
  // Navigation
  dashboard: string;
  users: string;
  events: string;
  parties: string;
  settings: string;
  logout: string;
  
  // Auth
  signIn: string;
  username: string;
  password: string;
  welcomeBack: string;
  signInFailed: string;
  fillAllFields: string;
  
  // Dashboard
  overview: string;
  statistics: string;
  upcomingEvents: string;
  recentActivity: string;
  nearestParty: string;
  nearestEvent: string;
  party: string;
  event: string;
  system: string;
  organizedBy: string;
  dateAndTime: string;
  at: string;
  location: string;
  expectedParticipants: string;
  people: string;
  eventPurpose: string;
  participationType: string;
  meetingDetails: string;
  meetingDate: string;
  meetingPlace: string;
  noUpcomingParties: string;
  noPartiesScheduled: string;
  noPartiesDescription: string;
  allPartiesInSystem: string;
  registeredSystemUsers: string;
  readyToProceed: string;
  awaitingConfirmation: string;
  eventStatusOverview: string;
  currentStatusDistribution: string;
  createNewUserAccount: string;
  specificPagePermissions: string;
  systemUsers: string;
  allRegisteredUsers: string;
  overviewAndStatistics: string;
  manageUsersAndPermissions: string;
  createAndManageEvents: string;
  viewEventParticipants: string;
  customizeTranslationValues: string;
  addUser: string;
  eventsList: string;
  allEventsInSystem: string;
  shown: string;
  nearestEvents: string;
  exportExcel: string;
  showFilters: string;
  addNewEvent: string;
  shareEvents: string;
  sortBy: string;
  selectSortOption: string;
  totalEvents: string;
  
  // Users
  userManagement: string;
  addNewUser: string;
  editUser: string;
  deleteUser: string;
  fullName: string;
  role: string;
  admin: string;
  coordinator: string;
  participant: string;
  permissions: string;
  created: string;
  updated: string;
  actions: string;
  
  // Events
  eventManagement: string;
  createEvent: string;
  editEvent: string;
  deleteEvent: string;
  eventDetails: string;
  day: string;
  date: string;
  time: string;
  duration: string;
  place: string;
  participants: string;
  status: string;
  pending: string;
  confirmed: string;
  completed: string;
  cancelled: string;
  
  // Status messages
  userCreated: string;
  userUpdated: string;
  userDeleted: string;
  eventCreated: string;
  eventUpdated: string;
  eventDeleted: string;
  accessDenied: string;
  onlyAdminsCan: string;
  
  // Dress fields
  pants: string;
  shirt: string;
  coat: string;
  shoes: string;
  whip: string;
  socks: string;
  accessories: string;
  
  // Sharing
  share: string;
  shareVia: string;
  downloadSample: string;
  importEvents: string;
  downloadExcelSample: string;
  importExcel: string;
  
  // Sidebar
  appTitle: string;
  managementSystem: string;
  
  // Excel
  excelTemplate: string;
  downloadTemplate: string;
  uploadExcel: string;
  selectFile: string;
  importSuccessful: string;
  importFailed: string;
}

// English translations
const enTranslations: Translations = {
  // Common
  loading: 'Loading...',
  error: 'Error',
  success: 'Success',
  cancel: 'Cancel',
  save: 'Save',
  delete: 'Delete',
  edit: 'Edit',
  add: 'Add',
  search: 'Search',
  filter: 'Filter',
  clear: 'Clear',
  confirm: 'Confirm',
  back: 'Back',
  next: 'Next',
  previous: 'Previous',
  
  // Navigation
  dashboard: 'Dashboard',
  users: 'Users',
  events: 'Events',
  parties: 'Parties',
  settings: 'Settings',
  logout: 'Logout',
  
  // Auth
  signIn: 'Sign In',
  username: 'Username',
  password: 'Password',
  welcomeBack: 'Welcome back!',
  signInFailed: 'Sign In Failed',
  fillAllFields: 'Please fill in all fields',
  
  // Dashboard
  overview: 'Overview',
  statistics: 'Statistics',
  upcomingEvents: 'Upcoming Events',
  recentActivity: 'Recent Activity',
  nearestParty: 'Nearest Party',
  nearestEvent: 'Nearest Event',
  party: 'Party',
  event: 'Event',
  system: 'System',
  organizedBy: 'Organized by',
  dateAndTime: 'Date & Time',
  at: 'at',
  location: 'Location',
  expectedParticipants: 'Expected Participants',
  people: 'people',
  eventPurpose: 'Event Purpose',
  participationType: 'Participation Type',
  meetingDetails: 'Meeting Details',
  meetingDate: 'Meeting Date',
  meetingPlace: 'Meeting Place',
  noUpcomingParties: 'No Upcoming Parties',
  noPartiesScheduled: 'No Parties Scheduled',
  noPartiesDescription: 'There are currently no confirmed parties scheduled. Check back later or create a new event.',
  allPartiesInSystem: 'All parties in the system',
  registeredSystemUsers: 'Registered system users',
  readyToProceed: 'Ready to proceed',
  awaitingConfirmation: 'Awaiting confirmation',
  eventStatusOverview: 'Event Status Overview',
  currentStatusDistribution: 'Current status distribution of all events',
  createNewUserAccount: 'Create a new user account with specific page permissions',
  specificPagePermissions: 'specific page permissions',
  systemUsers: 'System Users',
  allRegisteredUsers: 'All registered users in the system',
  overviewAndStatistics: 'Overview and statistics',
  manageUsersAndPermissions: 'Manage users and permissions',
  createAndManageEvents: 'Create and manage events',
  viewEventParticipants: 'View event participants',
  customizeTranslationValues: 'Customize translation values',
  addUser: 'Add User',
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
  
  // Users
  userManagement: 'User Management',
  addNewUser: 'Add New User',
  editUser: 'Edit User',
  deleteUser: 'Delete User',
  fullName: 'Full Name',
  role: 'Role',
  admin: 'Admin',
  coordinator: 'Coordinator',
  participant: 'Participant',
  permissions: 'Permissions',
  created: 'Created',
  updated: 'Updated',
  actions: 'Actions',
  
  // Events
  eventManagement: 'Event Management',
  createEvent: 'Create Event',
  editEvent: 'Edit Event',
  deleteEvent: 'Delete Event',
  eventDetails: 'Event Details',
  day: 'Day',
  date: 'Date',
  time: 'Time',
  duration: 'Duration',
  place: 'Place',
  participants: 'Participants',
  status: 'Status',
  pending: 'Pending',
  confirmed: 'Confirmed',
  completed: 'Completed',
  cancelled: 'Cancelled',
  
  // Status messages
  userCreated: 'User created successfully',
  userUpdated: 'User updated successfully',
  userDeleted: 'User deleted successfully',
  eventCreated: 'Event created successfully',
  eventUpdated: 'Event updated successfully',
  eventDeleted: 'Event deleted successfully',
  accessDenied: 'Access Denied',
  onlyAdminsCan: 'Only administrators can perform this action',
  
  // Dress fields
  pants: 'Pants',
  shirt: 'Shirt',
  coat: 'Coat',
  shoes: 'Shoes',
  whip: 'Whip',
  socks: 'Socks',
  accessories: 'Accessories',
  
  // Sharing
  share: 'Share',
  shareVia: 'Share via',
  downloadSample: 'Download Sample',
  importEvents: 'Import Events',
  downloadExcelSample: 'Download Excel Sample',
  importExcel: 'Import Excel',
  
  // Sidebar
  appTitle: 'Ayat Events',
  managementSystem: 'Management System',
  
  // Excel
  excelTemplate: 'Excel Template',
  downloadTemplate: 'Download Template',
  uploadExcel: 'Upload Excel',
  selectFile: 'Select File',
  importSuccessful: 'Import Successful',
  importFailed: 'Import Failed',
};

// Arabic translations
const arTranslations: Translations = {
  // Common
  loading: 'جاري التحميل...',
  error: 'خطأ',
  success: 'نجح',
  cancel: 'إلغاء',
  save: 'حفظ',
  delete: 'حذف',
  edit: 'تعديل',
  add: 'إضافة',
  search: 'بحث',
  filter: 'تصفية',
  clear: 'مسح',
  confirm: 'تأكيد',
  back: 'رجوع',
  next: 'التالي',
  previous: 'السابق',
  
  // Navigation
  dashboard: 'الصفحة الرئيسية',
  users: 'المستخدمين',
  events: 'ادارة المناسبات',
  parties: 'المناسبات',
  settings: 'الإعدادات',
  logout: 'تسجيل الخروج',
  
  // Auth
  signIn: 'تسجيل الدخول',
  username: 'اسم المستخدم',
  password: 'كلمة المرور',
  welcomeBack: 'مرحباً بعودتك!',
  signInFailed: 'فشل تسجيل الدخول',
  fillAllFields: 'يرجى ملء جميع الحقول',
  
  // Dashboard
  overview: 'نظرة عامة',
  statistics: 'الإحصائيات',
  upcomingEvents: 'الأحداث القادمة',
  recentActivity: 'النشاط الأخير',
  nearestParty: 'أقرب حفلة',
  nearestEvent: 'أقرب فعالية',
  party: 'حفلة',
  event: 'فعالية',
  system: 'النظام',
  organizedBy: 'منظم بواسطة',
  dateAndTime: 'التاريخ والوقت',
  at: 'في',
  location: 'الموقع',
  expectedParticipants: 'المشاركون المتوقعون',
  people: 'أشخاص',
  eventPurpose: 'غرض الحدث',
  participationType: 'نوع المشاركة',
  meetingDetails: 'تفاصيل الاجتماع',
  meetingDate: 'تاريخ الاجتماع',
  meetingPlace: 'مكان الاجتماع',
  noUpcomingParties: 'لا توجد حفلات قادمة',
  noPartiesScheduled: 'لا توجد حفلات مجدولة',
  noPartiesDescription: 'لا توجد حالياً حفلات مؤكدة مجدولة. تحقق مرة أخرى لاحقاً أو أنشئ حدثاً جديداً.',
  allPartiesInSystem: 'جميع الحفلات في النظام',
  registeredSystemUsers: 'مستخدمون مسجلون في النظام',
  readyToProceed: 'جاهز للمتابعة',
  awaitingConfirmation: 'في انتظار التأكيد',
  eventStatusOverview: 'نظرة عامة على حالة الأحداث',
  currentStatusDistribution: 'التوزيع الحالي لحالة جميع الأحداث',
  createNewUserAccount: 'إنشاء حساب مستخدم جديد مع أذونات صفحات محددة',
  specificPagePermissions: 'أذونات صفحات محددة',
  systemUsers: 'مستخدمو النظام',
  allRegisteredUsers: 'جميع المستخدمين المسجلين في النظام',
  overviewAndStatistics: 'نظرة عامة وإحصائيات',
  manageUsersAndPermissions: 'إدارة المستخدمين والأذونات',
  createAndManageEvents: 'إنشاء وإدارة الأحداث',
  viewEventParticipants: 'عرض مشاركي الأحداث',
  customizeTranslationValues: 'تخصيص قيم الترجمة',
  addUser: 'إضافة مستخدم',
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
  
  // Users
  userManagement: 'إدارة المستخدمين',
  addNewUser: 'إضافة مستخدم جديد',
  editUser: 'تعديل المستخدم',
  deleteUser: 'حذف المستخدم',
  fullName: 'الاسم الكامل',
  role: 'الدور',
  admin: 'مدير',
  coordinator: 'منسق',
  participant: 'مشارك',
  permissions: 'الصلاحيات',
  created: 'تاريخ الإنشاء',
  updated: 'تاريخ التحديث',
  actions: 'الإجراءات',
  
  // Events
  eventManagement: 'إدارة الأحداث',
  createEvent: 'إنشاء حدث',
  editEvent: 'تعديل الحدث',
  deleteEvent: 'حذف الحدث',
  eventDetails: 'تفاصيل الحدث',
  day: 'اليوم',
  date: 'التاريخ',
  time: 'الوقت',
  duration: 'المدة',
  place: 'المكان',
  participants: 'المشاركون',
  status: 'الحالة',
  pending: 'معلق',
  confirmed: 'مؤكد',
  completed: 'مكتمل',
  cancelled: 'ملغي',
  
  // Status messages
  userCreated: 'تم إنشاء المستخدم بنجاح',
  userUpdated: 'تم تحديث المستخدم بنجاح',
  userDeleted: 'تم حذف المستخدم بنجاح',
  eventCreated: 'تم إنشاء الحدث بنجاح',
  eventUpdated: 'تم تحديث الحدث بنجاح',
  eventDeleted: 'تم حذف الحدث بنجاح',
  accessDenied: 'تم رفض الوصول',
  onlyAdminsCan: 'يمكن للمديرين فقط تنفيذ هذا الإجراء',
  
  // Dress fields
  pants: 'بنطلون',
  shirt: 'قميص',
  coat: 'معطف',
  shoes: 'حذاء',
  whip: 'قشاط',
  socks: 'جوارب',
  accessories: 'اكسسوارات',
  
  // Sharing
  share: 'مشاركة',
  shareVia: 'مشاركة عبر',
  downloadSample: 'تحميل عينة',
  importEvents: 'استيراد الأحداث',
  downloadExcelSample: 'تحميل عينة إكسل',
  importExcel: 'استيراد إكسل',
  
  // Sidebar
  appTitle: 'أحداث الآيات',
  managementSystem: 'نظام الإدارة',
  
  // Excel
  excelTemplate: 'قالب إكسل',
  downloadTemplate: 'تحميل القالب',
  uploadExcel: 'رفع إكسل',
  selectFile: 'اختيار ملف',
  importSuccessful: 'تم الاستيراد بنجاح',
  importFailed: 'فشل الاستيراد',
};

interface LanguageContextType {
  language: 'en' | 'ar';
  setLanguage: (lang: 'en' | 'ar') => void;
  t: Translations;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<'en' | 'ar'>('en');
  const [translations, setTranslations] = useState(enTranslations);

  // Load language from localStorage on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as 'en' | 'ar' | null;
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'ar')) {
      setLanguage(savedLanguage);
    }
  }, []);

  // Save language to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('language', language);
    // Update document direction
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  // Subscribe to translation service changes
  useEffect(() => {
    const unsubscribe = translationService.subscribe(() => {
      updateTranslations();
    });
    updateTranslations();
    return () => {
      unsubscribe();
    };
  }, [language]);

  // Update translations from service
  const updateTranslations = () => {
    const serviceTranslations = translationService.getAllTranslations();
    const baseTranslations = language === 'ar' ? arTranslations : enTranslations;
    
    // Merge service translations with base translations
    const mergedTranslations = { ...baseTranslations };
    Object.entries(serviceTranslations).forEach(([key, translation]) => {
      mergedTranslations[key] = translation[language] || translation.en || baseTranslations[key] || key;
    });
    
    setTranslations(mergedTranslations);
  };

  const isRTL = language === 'ar';

  const value = {
    language,
    setLanguage,
    t: translations,
    isRTL,
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};
