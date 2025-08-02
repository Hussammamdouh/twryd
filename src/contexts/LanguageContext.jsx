import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    // Get language from localStorage or default to 'en'
    return localStorage.getItem('app_language') || 'en';
  });

  const translations = {
    en: {
      // Admin Dashboard
      'admin.dashboard': 'Admin Dashboard',
      'admin.categories': 'Categories',
      'admin.areas': 'Areas',
      'admin.governorates': 'Governorates',
      'admin.administrators': 'Administrators',
      'admin.clients': 'Clients',
      'admin.suppliers': 'Suppliers',
      
      // Common
      'common.add': 'Add',
      'common.edit': 'Edit',
      'common.delete': 'Delete',
      'common.save': 'Save',
      'common.cancel': 'Cancel',
      'common.search': 'Search',
      'common.loading': 'Loading...',
      'common.active': 'Active',
      'common.inactive': 'Inactive',
      'common.yes': 'Yes',
      'common.no': 'No',
      'common.confirm': 'Confirm',
      'common.back': 'Back',
      'common.next': 'Next',
      'common.previous': 'Previous',
      'common.submit': 'Submit',
      'common.close': 'Close',
      'common.open': 'Open',
      'common.refresh': 'Refresh',
      'common.export': 'Export',
      'common.import': 'Import',
      'common.download': 'Download',
      'common.upload': 'Upload',
      'common.view': 'View',
      'common.details': 'Details',
      'common.actions': 'Actions',
      'common.status': 'Status',
      'common.name': 'Name',
      'common.email': 'Email',
      'common.phone': 'Phone',
      'common.address': 'Address',
      'common.created_at': 'Created At',
      'common.updated_at': 'Updated At',
      'common.management': 'Management',
      'common.retry': 'Retry',
      'common.user': 'User',
      'common.changes': 'Changes',
      'common.total': 'total',
      
      // Search
      'search.placeholder': 'Search...',
      
      // Profile
      'profile.failed_to_load': 'Failed to load profile',
      'profile.logout_confirm': 'Are you sure you want to logout?',
      'profile.logout': 'Logout',
      'profile.default_name': 'Administrator',
      'profile.administrator': 'Administrator',
      'profile.super_administrator': 'Super Administrator',
      'profile.it_support': 'IT Support',
      'profile.account_type': 'Account Type',
      'profile.secure_admin_account': 'Secure Admin Account',
      
      // Categories
      'categories.title': 'Categories Management',
      'categories.subtitle': 'Organize products with categories and manage their visibility',
      'categories.add': 'Add Category',
      'categories.edit': 'Edit Category',
      'categories.delete': 'Delete Category',
      'categories.name_en': 'Category Name (English)',
      'categories.name_ar': 'Category Name (Arabic)',
      'categories.icon': 'Icon',
      'categories.icon_required': 'Icon is required',
      'categories.icon_optional': 'Icon (optional)',
      'categories.remove_icon': 'Remove current icon',
      'categories.active_category': 'Active Category',
      'categories.inactive_categories_warning': 'Inactive categories won\'t appear in product listings',
      'categories.no_categories': 'No categories found',
      'categories.get_started': 'Get started by creating your first category',
      'categories.loading': 'Loading categories...',
      'categories.created': 'Category created!',
      'categories.updated': 'Category updated!',
      'categories.deleted': 'Category deleted!',
      'categories.delete_confirm': 'Are you sure you want to delete this category?',
      'categories.delete_warning': 'This action cannot be undone.',
      
      // Areas
      'areas.title': 'Areas Management',
      'areas.subtitle': 'Manage delivery areas and their geographic boundaries',
      'areas.add': 'Add Area',
      'areas.edit': 'Edit Area',
      'areas.delete': 'Delete Area',
      'areas.name': 'Area Name',
      'areas.governorate': 'Governorate',
      'areas.polygon_points': 'Polygon Points',
      'areas.select_governorate': 'Select a governorate to view areas',
      'areas.choose_governorate': 'Choose a governorate from the dropdown above to see its areas',
      'areas.no_areas': 'No areas found',
      'areas.loading': 'Loading areas...',
      'areas.created': 'Area created successfully!',
      'areas.updated': 'Area updated successfully!',
      'areas.deleted': 'Area deleted successfully!',
      'areas.delete_confirm': 'Are you sure you want to delete this area?',
      'areas.delete_warning': 'This action cannot be undone.',
      'areas.search_placeholder': 'Search areas by name or governorate...',
      'areas.all_governorates': 'All Governorates',
      'areas.filter_by_governorate': 'Filter by governorate',
      'areas.table_name': 'Name',
      'areas.table_governorate': 'Governorate',
      'areas.table_polygon_points': 'Polygon Points',
      'areas.table_actions': 'Actions',
      'areas.adding': 'Adding...',
      
      // Form validation
      'validation.required': 'This field is required.',
      'validation.email': 'Please enter a valid email address.',
      'validation.phone': 'Please enter a valid phone number.',
      'validation.min_length': 'Must be at least {min} characters.',
      'validation.max_length': 'Must be less than {max} characters.',
      'validation.password_requirements': 'Password must be at least 8 characters and contain: uppercase letter, lowercase letter, number, and special character.',
      'validation.passwords_not_match': 'Passwords do not match.',
      'validation.positive_number': 'Must be a positive number.',
      'validation.percentage_range': 'Must be between 0-100.',
      'validation.image_required': 'Image is required.',
      'validation.image_type': 'File must be an image.',
      'validation.file_size': 'File must be less than {size}MB.',
      
      // Messages
      'messages.success': 'Success!',
      'messages.error': 'Error!',
      'messages.warning': 'Warning!',
      'messages.info': 'Information',
      'messages.please_fix_errors': 'Please fix the errors in the form.',
      'messages.failed_to_submit': 'Failed to submit',
      'messages.failed_to_load': 'Failed to load data',
      'messages.failed_to_delete': 'Failed to delete',
      'messages.failed_to_update': 'Failed to update',
      'messages.failed_to_create': 'Failed to create',
      'messages.operation_successful': 'Operation completed successfully!',
      'messages.operation_failed': 'Operation failed. Please try again.',
      'messages.confirm_action': 'Are you sure you want to perform this action?',
      'messages.unsaved_changes': 'You have unsaved changes. Are you sure you want to leave?',
      'messages.something_went_wrong': 'Something went wrong while loading this page.',
      'messages.try_adjusting_filters': 'Try adjusting your search or filters',
      
      // Navigation
      'nav.dashboard': 'Dashboard',
      'nav.categories': 'Categories',
      'nav.areas': 'Areas',
      'nav.governorates': 'Governorates',
      'nav.administrators': 'Administrators',
      'nav.clients': 'Clients',
      'nav.suppliers': 'Suppliers',
      'nav.settings': 'Settings',
      'nav.profile': 'Profile',
      'nav.logout': 'Logout',
      
      // Administrators
      'administrators.title': 'Administrators Management',
      'administrators.subtitle': 'Manage system administrators and their permissions',
      'administrators.add': 'Add New Administrator',
      'administrators.edit': 'Edit Administrator',
      'administrators.delete': 'Delete Administrator',
      'administrators.manage': 'Manage Administrators',
      'administrators.role': 'Role',
      'administrators.superadmin': 'Super Admin',
      'administrators.admin': 'Admin',
      'administrators.loading': 'Loading administrators...',
      'administrators.no_administrators': 'No administrators found',
      'administrators.get_started': 'Get started by adding your first administrator',
      'administrators.add_administrator': '+ Add Administrator',
      'administrators.delete_confirm': 'Delete admin {name}?',
      'administrators.created': 'Administrator created',
      'administrators.updated': 'Administrator updated',
      'administrators.deleted': 'Administrator deleted',
      
      // Suppliers
      'suppliers.title': 'Suppliers Management',
      'suppliers.subtitle': 'Manage supplier accounts and their status',
      'suppliers.search_placeholder': 'Search suppliers by name, email, or phone...',
      'suppliers.all_statuses': 'All Statuses',
      'suppliers.pending': 'Pending',
      'suppliers.rejected': 'Rejected',
      'suppliers.approve': 'Approve',
      'suppliers.reject': 'Reject',
      'suppliers.toggle_status': 'Toggle Status',
      'suppliers.verify_email': 'Verify Email',
      'suppliers.loading': 'Loading suppliers...',
      'suppliers.no_suppliers': 'No suppliers found',
      'suppliers.no_matches': 'No suppliers match your current filters',
      'suppliers.approved': 'Supplier approved successfully',
      'suppliers.rejected_success': 'Supplier rejected successfully',
      'suppliers.status_toggled': 'Supplier status toggled successfully',
      'suppliers.email_verified': 'Supplier email verified successfully',
      'suppliers.deleted': 'Supplier deleted successfully',
      'suppliers.approve_confirm': 'Are you sure you want to approve {name}?',
      'suppliers.reject_confirm': 'Are you sure you want to reject {name}?',
      'suppliers.delete_confirm': 'Are you sure you want to delete {name}? This action cannot be undone.',
      'suppliers.toggle_confirm': 'Are you sure you want to {action} {name}?',
      'suppliers.activate': 'activate',
      'suppliers.deactivate': 'deactivate',
      'suppliers.showing': 'Showing {from} to {to} of {total} suppliers',
      'suppliers.page': 'Page {current} of {total}',
      'suppliers.per_page': 'per page',
      
      // Governorates
      'governorates.title': 'Governorates',
      'governorates.subtitle': 'View all available governorates in the system',
      'governorates.view': 'View',
      'governorates.all_governorates': 'All Governorates',
      'governorates.count': '{count} governorate{plural}',
      'governorates.loading': 'Loading governorates...',
      'governorates.no_governorates': 'No governorates found',
      'governorates.id': 'ID',
      
      // Form Fields
      'form.full_name': 'Full Name',
      'form.email_address': 'Email Address',
      'form.phone_number': 'Phone Number',
      'form.password': 'Password',
      'form.confirm_password': 'Confirm Password',
      'form.role': 'Role',
      'form.select_role': 'Select a role',
      'form.active_account': 'Active Account',
      'form.required': 'Required',
      'form.optional': 'Optional',
      
      // Form Validation Messages
      'form.name_required': 'Name is required.',
      'form.name_min_length': 'Name must be at least 2 characters.',
      'form.name_max_length': 'Name must be less than 50 characters.',
      'form.email_required': 'Email is required.',
      'form.email_invalid': 'Please enter a valid email address.',
      'form.phone_required': 'Phone number is required.',
      'form.phone_invalid': 'Please enter a valid phone number.',
      'form.password_required': 'Password is required.',
      'form.password_requirements': 'Password must be at least 8 characters and contain: uppercase letter, lowercase letter, number, and special character.',
      'form.confirm_password_required': 'Password confirmation is required.',
      'form.passwords_not_match': 'Passwords do not match.',
      'form.role_required': 'Role is required.',
      
      // Form Placeholders
      'form.placeholder.full_name': 'Enter administrator\'s full name',
      'form.placeholder.email': 'Enter email address',
      'form.placeholder.phone': 'Enter phone number (e.g., 01234567890)',
      'form.placeholder.password': 'Enter secure password',
      'form.placeholder.confirm_password': 'Confirm your password',
      'form.placeholder.category_name_en': 'Enter category name in English',
      'form.placeholder.category_name_ar': 'أدخل اسم الفئة بالعربية',
      'form.placeholder.area_name': 'Enter area name',
      
      // Form Actions
      'form.cancel': 'Cancel',
      'form.create': 'Create',
      'form.update': 'Update',
      'form.save': 'Save',
      'form.show_password': 'Show password',
      'form.hide_password': 'Hide password',
      
      // Modal Titles
      'modal.add_administrator': 'Add New Administrator',
      'modal.edit_administrator': 'Edit Administrator',
      'modal.add_category': 'Add New Category',
      'modal.edit_category': 'Edit Category',
      'modal.add_area': 'Add New Area',
      'modal.edit_area': 'Edit Area',
      
      // Language
      'language.english': 'English',
      'language.arabic': 'العربية',
      'language.switch': 'Switch Language',
      
      // Login
      'login.admin_title': 'Admin Login',
      'login.subtitle': 'Access the administrative dashboard',
      'login.email_label': 'Email Address *',
      'login.password_label': 'Password *',
      'login.email_placeholder': 'Enter your email address',
      'login.password_placeholder': 'Enter your password',
      'login.sign_in': 'Sign In',
      'login.signing_in': 'Signing In...',
      'login.need_help': 'Need help? Contact your system administrator',
      'login.secure_access': 'Secure Admin Access',
      'login.show_password': 'Show password',
      'login.hide_password': 'Hide password',
      'login.email_required': 'Email is required.',
      'login.email_invalid': 'Please enter a valid email address.',
      'login.password_required': 'Password is required.',
      'login.password_min_length': 'Password must be at least 6 characters.',
      'login.login_successful': 'Login successful! Welcome back!',
      'login.login_failed': 'Login failed. Please check your credentials.',
    },
    ar: {
      // Admin Dashboard
      'admin.dashboard': 'لوحة تحكم المدير',
      'admin.categories': 'الفئات',
      'admin.areas': 'المناطق',
      'admin.governorates': 'المحافظات',
      'admin.administrators': 'المديرين',
      'admin.clients': 'العملاء',
      'admin.suppliers': 'الموردين',
      
      // Common
      'common.add': 'إضافة',
      'common.edit': 'تعديل',
      'common.delete': 'حذف',
      'common.save': 'حفظ',
      'common.cancel': 'إلغاء',
      'common.search': 'بحث',
      'common.loading': 'جاري التحميل...',
      'common.active': 'نشط',
      'common.inactive': 'غير نشط',
      'common.yes': 'نعم',
      'common.no': 'لا',
      'common.confirm': 'تأكيد',
      'common.back': 'رجوع',
      'common.next': 'التالي',
      'common.previous': 'السابق',
      'common.submit': 'إرسال',
      'common.close': 'إغلاق',
      'common.open': 'فتح',
      'common.refresh': 'تحديث',
      'common.export': 'تصدير',
      'common.import': 'استيراد',
      'common.download': 'تحميل',
      'common.upload': 'رفع',
      'common.view': 'عرض',
      'common.details': 'التفاصيل',
      'common.actions': 'الإجراءات',
      'common.status': 'الحالة',
      'common.name': 'الاسم',
      'common.email': 'البريد الإلكتروني',
      'common.phone': 'الهاتف',
      'common.address': 'العنوان',
      'common.created_at': 'تاريخ الإنشاء',
      'common.updated_at': 'تاريخ التحديث',
      'common.management': 'الإدارة',
      'common.retry': 'إعادة المحاولة',
      'common.user': 'المستخدم',
      'common.changes': 'التغييرات',
      'common.total': 'إجمالي',
      
      // Search
      'search.placeholder': 'البحث...',
      
      // Profile
      'profile.failed_to_load': 'فشل في تحميل الملف الشخصي',
      'profile.logout_confirm': 'هل أنت متأكد من تسجيل الخروج؟',
      'profile.logout': 'تسجيل الخروج',
      'profile.default_name': 'المدير',
      'profile.administrator': 'المدير',
      'profile.super_administrator': 'المدير الرئيسي',
      'profile.it_support': 'دعم التكنولوجيا',
      'profile.account_type': 'نوع الحساب',
      'profile.secure_admin_account': 'حساب المدير الآمن',
      
      // Categories
      'categories.title': 'إدارة الفئات',
      'categories.subtitle': 'إدارة المنتجات بالفئات وإدارة ظهورها',
      'categories.add': 'إضافة فئة',
      'categories.edit': 'تعديل الفئة',
      'categories.delete': 'حذف الفئة',
      'categories.name_en': 'اسم الفئة (الإنجليزية)',
      'categories.name_ar': 'اسم الفئة (العربية)',
      'categories.icon': 'الأيقونة',
      'categories.icon_required': 'الأيقونة مطلوبة',
      'categories.icon_optional': 'الأيقونة (اختيارية)',
      'categories.remove_icon': 'إزالة الأيقونة الحالية',
      'categories.active_category': 'فئة نشطة',
      'categories.inactive_categories_warning': 'الفئات غير النشطة لن تظهر في قوائم المنتجات',
      'categories.no_categories': 'لم يتم العثور على فئات',
      'categories.get_started': 'ابدأ بإنشاء فئتك الأولى',
      'categories.loading': 'جاري تحميل الفئات...',
      'categories.created': 'تم إنشاء الفئة!',
      'categories.updated': 'تم تحديث الفئة!',
      'categories.deleted': 'تم حذف الفئة!',
      'categories.delete_confirm': 'هل أنت متأكد من حذف هذه الفئة؟',
      'categories.delete_warning': 'لا يمكن التراجع عن هذا الإجراء.',
      
      // Areas
      'areas.title': 'إدارة المناطق',
      'areas.subtitle': 'إدارة مناطق التوصيل وحدودها الجغرافية',
      'areas.add': 'إضافة منطقة',
      'areas.edit': 'تعديل المنطقة',
      'areas.delete': 'حذف المنطقة',
      'areas.name': 'اسم المنطقة',
      'areas.governorate': 'المحافظة',
      'areas.polygon_points': 'نقاط المضلع',
      'areas.select_governorate': 'اختر محافظة لعرض المناطق',
      'areas.choose_governorate': 'اختر محافظة من القائمة المنسدلة أعلاه لرؤية مناطقها',
      'areas.no_areas': 'لم يتم العثور على مناطق',
      'areas.loading': 'جاري تحميل المناطق...',
      'areas.created': 'تم إنشاء المنطقة بنجاح!',
      'areas.updated': 'تم تحديث المنطقة بنجاح!',
      'areas.deleted': 'تم حذف المنطقة بنجاح!',
      'areas.delete_confirm': 'هل أنت متأكد من حذف هذه المنطقة؟',
      'areas.delete_warning': 'لا يمكن التراجع عن هذا الإجراء.',
      'areas.search_placeholder': 'البحث في المناطق بالاسم أو المحافظة...',
      'areas.all_governorates': 'جميع المحافظات',
      'areas.filter_by_governorate': 'تصفية حسب المحافظة',
      'areas.table_name': 'الاسم',
      'areas.table_governorate': 'المحافظة',
      'areas.table_polygon_points': 'نقاط المضلع',
      'areas.table_actions': 'الإجراءات',
      'areas.adding': 'جاري الإضافة...',
      
      // Form validation
      'validation.required': 'هذا الحقل مطلوب.',
      'validation.email': 'يرجى إدخال عنوان بريد إلكتروني صحيح.',
      'validation.phone': 'يرجى إدخال رقم هاتف صحيح.',
      'validation.min_length': 'يجب أن يكون على الأقل {min} أحرف.',
      'validation.max_length': 'يجب أن يكون أقل من {max} أحرف.',
      'validation.password_requirements': 'يجب أن تحتوي كلمة المرور على 8 أحرف على الأقل وتتضمن: حرف كبير، حرف صغير، رقم، ورمز خاص.',
      'validation.passwords_not_match': 'كلمات المرور غير متطابقة.',
      'validation.positive_number': 'يجب أن يكون رقماً موجباً.',
      'validation.percentage_range': 'يجب أن يكون بين 0-100.',
      'validation.image_required': 'الصورة مطلوبة.',
      'validation.image_type': 'يجب أن يكون الملف صورة.',
      'validation.file_size': 'يجب أن يكون الملف أقل من {size} ميجابايت.',
      
      // Messages
      'messages.success': 'نجح!',
      'messages.error': 'خطأ!',
      'messages.warning': 'تحذير!',
      'messages.info': 'معلومات',
      'messages.please_fix_errors': 'يرجى إصلاح الأخطاء في النموذج.',
      'messages.failed_to_submit': 'فشل في الإرسال',
      'messages.failed_to_load': 'فشل في تحميل البيانات',
      'messages.failed_to_delete': 'فشل في الحذف',
      'messages.failed_to_update': 'فشل في التحديث',
      'messages.failed_to_create': 'فشل في الإنشاء',
      'messages.operation_successful': 'تمت العملية بنجاح!',
      'messages.operation_failed': 'فشلت العملية. يرجى المحاولة مرة أخرى.',
      'messages.confirm_action': 'هل أنت متأكد من تنفيذ هذا الإجراء؟',
      'messages.unsaved_changes': 'لديك تغييرات غير محفوظة. هل أنت متأكد من المغادرة؟',
      'messages.something_went_wrong': 'حدث خطأ أثناء تحميل هذه الصفحة.',
      'messages.try_adjusting_filters': 'حاول تعديل البحث أو المرشحات',
      
      // Navigation
      'nav.dashboard': 'لوحة التحكم',
      'nav.categories': 'الفئات',
      'nav.areas': 'المناطق',
      'nav.governorates': 'المحافظات',
      'nav.administrators': 'المديرين',
      'nav.clients': 'العملاء',
      'nav.suppliers': 'الموردين',
      'nav.settings': 'الإعدادات',
      'nav.profile': 'الملف الشخصي',
      'nav.logout': 'تسجيل الخروج',
      
      // Administrators
      'administrators.title': 'إدارة المديرين',
      'administrators.subtitle': 'إدارة مديري النظام وصلاحياتهم',
      'administrators.add': 'إضافة مدير جديد',
      'administrators.edit': 'تعديل المدير',
      'administrators.delete': 'حذف المدير',
      'administrators.manage': 'إدارة المديرين',
      'administrators.role': 'الدور',
      'administrators.superadmin': 'مدير رئيسي',
      'administrators.admin': 'مدير',
      'administrators.loading': 'جاري تحميل المديرين...',
      'administrators.no_administrators': 'لم يتم العثور على مديرين',
      'administrators.get_started': 'ابدأ بإضافة أول مدير لك',
      'administrators.add_administrator': '+ إضافة مدير',
      'administrators.delete_confirm': 'حذف المدير {name}؟',
      'administrators.created': 'تم إنشاء المدير',
      'administrators.updated': 'تم تحديث المدير',
      'administrators.deleted': 'تم حذف المدير',
      
      // Suppliers
      'suppliers.title': 'إدارة الموردين',
      'suppliers.subtitle': 'إدارة حسابات الموردين وحالتهم',
      'suppliers.search_placeholder': 'البحث في الموردين بالاسم أو البريد الإلكتروني أو الهاتف...',
      'suppliers.all_statuses': 'جميع الحالات',
      'suppliers.pending': 'في الانتظار',
      'suppliers.rejected': 'مرفوض',
      'suppliers.approve': 'موافقة',
      'suppliers.reject': 'رفض',
      'suppliers.toggle_status': 'تبديل الحالة',
      'suppliers.verify_email': 'التحقق من البريد الإلكتروني',
      'suppliers.loading': 'جاري تحميل الموردين...',
      'suppliers.no_suppliers': 'لم يتم العثور على موردين',
      'suppliers.no_matches': 'لا يوجد موردين يطابقون المرشحات الحالية',
      'suppliers.approved': 'تمت الموافقة على المورد بنجاح',
      'suppliers.rejected_success': 'تم رفض المورد بنجاح',
      'suppliers.status_toggled': 'تم تبديل حالة المورد بنجاح',
      'suppliers.email_verified': 'تم التحقق من بريد المورد الإلكتروني بنجاح',
      'suppliers.deleted': 'تم حذف المورد بنجاح',
      'suppliers.approve_confirm': 'هل أنت متأكد من الموافقة على {name}؟',
      'suppliers.reject_confirm': 'هل أنت متأكد من رفض {name}؟',
      'suppliers.delete_confirm': 'هل أنت متأكد من حذف {name}؟ لا يمكن التراجع عن هذا الإجراء.',
      'suppliers.toggle_confirm': 'هل أنت متأكد من {action} {name}؟',
      'suppliers.activate': 'تفعيل',
      'suppliers.deactivate': 'إلغاء التفعيل',
      'suppliers.showing': 'عرض {from} إلى {to} من {total} مورد',
      'suppliers.page': 'الصفحة {current} من {total}',
      'suppliers.per_page': 'في الصفحة',
      
      // Governorates
      'governorates.title': 'المحافظات',
      'governorates.subtitle': 'عرض جميع المحافظات المتاحة في النظام',
      'governorates.view': 'عرض',
      'governorates.all_governorates': 'جميع المحافظات',
      'governorates.count': '{count} محافظة{plural}',
      'governorates.loading': 'جاري تحميل المحافظات...',
      'governorates.no_governorates': 'لم يتم العثور على محافظات',
      'governorates.id': 'الرقم التعريفي',
      
      // Form Fields
      'form.full_name': 'الاسم الكامل',
      'form.email_address': 'عنوان البريد الإلكتروني',
      'form.phone_number': 'رقم الهاتف',
      'form.password': 'كلمة المرور',
      'form.confirm_password': 'تأكيد كلمة المرور',
      'form.role': 'الدور',
      'form.select_role': 'اختر دوراً',
      'form.active_account': 'حساب نشط',
      'form.required': 'مطلوب',
      'form.optional': 'اختياري',
      
      // Form Validation Messages
      'form.name_required': 'الاسم مطلوب.',
      'form.name_min_length': 'يجب أن يكون الاسم على الأقل حرفين.',
      'form.name_max_length': 'يجب أن يكون الاسم أقل من 50 حرفاً.',
      'form.email_required': 'البريد الإلكتروني مطلوب.',
      'form.email_invalid': 'يرجى إدخال عنوان بريد إلكتروني صحيح.',
      'form.phone_required': 'رقم الهاتف مطلوب.',
      'form.phone_invalid': 'يرجى إدخال رقم هاتف صحيح.',
      'form.password_required': 'كلمة المرور مطلوبة.',
      'form.password_requirements': 'يجب أن تحتوي كلمة المرور على 8 أحرف على الأقل وتتضمن: حرف كبير، حرف صغير، رقم، ورمز خاص.',
      'form.confirm_password_required': 'تأكيد كلمة المرور مطلوب.',
      'form.passwords_not_match': 'كلمات المرور غير متطابقة.',
      'form.role_required': 'الدور مطلوب.',
      
      // Form Placeholders
      'form.placeholder.full_name': 'أدخل الاسم الكامل للمدير',
      'form.placeholder.email': 'أدخل عنوان البريد الإلكتروني',
      'form.placeholder.phone': 'أدخل رقم الهاتف (مثال: 01234567890)',
      'form.placeholder.password': 'أدخل كلمة مرور آمنة',
      'form.placeholder.confirm_password': 'أكد كلمة المرور',
      'form.placeholder.category_name_en': 'أدخل اسم الفئة بالإنجليزية',
      'form.placeholder.category_name_ar': 'أدخل اسم الفئة بالعربية',
      'form.placeholder.area_name': 'أدخل اسم المنطقة',
      
      // Form Actions
      'form.cancel': 'إلغاء',
      'form.create': 'إنشاء',
      'form.update': 'تحديث',
      'form.save': 'حفظ',
      'form.show_password': 'إظهار كلمة المرور',
      'form.hide_password': 'إخفاء كلمة المرور',
      
      // Modal Titles
      'modal.add_administrator': 'إضافة مدير جديد',
      'modal.edit_administrator': 'تعديل المدير',
      'modal.add_category': 'إضافة فئة جديدة',
      'modal.edit_category': 'تعديل الفئة',
      'modal.add_area': 'إضافة منطقة جديدة',
      'modal.edit_area': 'تعديل المنطقة',
      
      // Language
      'language.english': 'English',
      'language.arabic': 'العربية',
      'language.switch': 'تغيير اللغة',
      
      // Login
      'login.admin_title': 'تسجيل دخول المدير',
      'login.subtitle': 'الوصول إلى لوحة تحكم الإدارة',
      'login.email_label': 'عنوان البريد الإلكتروني *',
      'login.password_label': 'كلمة المرور *',
      'login.email_placeholder': 'أدخل عنوان بريدك الإلكتروني',
      'login.password_placeholder': 'أدخل كلمة المرور',
      'login.sign_in': 'تسجيل الدخول',
      'login.signing_in': 'جاري تسجيل الدخول...',
      'login.need_help': 'تحتاج مساعدة؟ اتصل بمدير النظام',
      'login.secure_access': 'وصول آمن للمدير',
      'login.show_password': 'إظهار كلمة المرور',
      'login.hide_password': 'إخفاء كلمة المرور',
      'login.email_required': 'البريد الإلكتروني مطلوب.',
      'login.email_invalid': 'يرجى إدخال عنوان بريد إلكتروني صحيح.',
      'login.password_required': 'كلمة المرور مطلوبة.',
      'login.password_min_length': 'يجب أن تكون كلمة المرور 6 أحرف على الأقل.',
      'login.login_successful': 'تم تسجيل الدخول بنجاح! مرحباً بعودتك!',
      'login.login_failed': 'فشل تسجيل الدخول. يرجى التحقق من بيانات الاعتماد.',
    }
  };

  const changeLanguage = (language) => {
    setCurrentLanguage(language);
    localStorage.setItem('app_language', language);
    // Set document direction for RTL languages
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  };

  const t = (key, params = {}) => {
    let translation = translations[currentLanguage][key] || translations.en[key] || key;
    
    // Replace parameters in translation
    Object.keys(params).forEach(param => {
      translation = translation.replace(`{${param}}`, params[param]);
    });
    
    return translation;
  };

  useEffect(() => {
    // Set initial document direction
    document.documentElement.dir = currentLanguage === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = currentLanguage;
  }, [currentLanguage]);

  const value = {
    currentLanguage,
    changeLanguage,
    t,
    translations: translations[currentLanguage],
    isRTL: currentLanguage === 'ar'
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}; 