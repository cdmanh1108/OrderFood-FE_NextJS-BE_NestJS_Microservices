// ======================
// IAM SERVICE
// ======================
export const IAM_PATTERNS = {
  VALIDATE_TOKEN: 'iam.validate_token',
  GET_PROFILE: 'iam.get_profile',

  REGISTER: 'iam.register',
  LOGIN: 'iam.login',

  CREATE_STAFF_USER: 'iam.user.staff.create',
  LIST_STAFF_USERS: 'iam.user.staff.list',
  GET_STAFF_USER_DETAIL: 'iam.user.staff.get_detail',
  UPDATE_STAFF_USER: 'iam.user.staff.update',
  DELETE_STAFF_USER: 'iam.user.staff.delete',
} as const;

// ======================
// CATALOG SERVICE
// ======================
export const CATALOG_PATTERNS = {
  // Category
  CREATE_CATEGORY: 'catalog.category.create',
  UPDATE_CATEGORY: 'catalog.category.update',
  GET_CATEGORY_DETAIL: 'catalog.category.get_detail',
  LIST_CATEGORIES: 'catalog.category.list',
  SET_CATEGORY_ACTIVE: 'catalog.category.set_active',
  DELETE_CATEGORY: 'catalog.category.delete',
  FIND_CATEGORY: 'catalog.category.find-one',

  // Menu Item
  CREATE_MENU_ITEM: 'catalog.menu_item.create',
  UPDATE_MENU_ITEM: 'catalog.menu_item.update',
  GET_MENU_ITEM_DETAIL: 'catalog.menu_item.get_detail',
  LIST_MENU_ITEMS: 'catalog.menu_item.list',
  SET_MENU_ITEM_ACTIVE: 'catalog.menu_item.set_active',
  DELETE_MENU_ITEM: 'catalog.menu_item.delete',
} as const;

// ======================
// ORDERING SERVICE
// ======================
export const ORDERING_PATTERNS = {
  CREATE_ORDER: 'ordering.create_order',
  GET_ORDER_DETAIL: 'ordering.get_order_detail',
  LIST_ORDERS: 'ordering.list_orders',
  CANCEL_ORDER: 'ordering.cancel_order',
} as const;

// ======================
// DINE-IN SERVICE
// ======================
export const DINEIN_PATTERNS = {
  CREATE_TABLE: 'dinein.create_table',
  UPDATE_TABLE: 'dinein.update_table',
  GET_TABLE_DETAIL: 'dinein.get_table_detail',
  LIST_TABLES: 'dinein.list_tables',

  CREATE_RESERVATION: 'dinein.create_reservation',
  LIST_RESERVATIONS: 'dinein.list_reservations',
} as const;

// ======================
// PAYMENT SERVICE
// ======================
export const PAYMENT_PATTERNS = {
  CREATE_PAYMENT: 'payment.create_payment',
  VERIFY_PAYMENT: 'payment.verify_payment',
  GET_PAYMENT_DETAIL: 'payment.get_payment_detail',
} as const;

// ======================
// NOTIFICATION SERVICE
// ======================
export const NOTIFICATION_PATTERNS = {
  SEND_VERIFY_EMAIL: 'notification.email.send_verify',
  SEND_EMAIL: 'notification.send_email',
  SEND_SMS: 'notification.send_sms',
  PUSH_NOTIFICATION: 'notification.push_notification',
} as const;

// ======================
// REVIEW SERVICE
// ======================
export const REVIEW_PATTERNS = {
  CREATE_REVIEW: 'review.create_review',
  UPDATE_REVIEW: 'review.update_review',
  DELETE_REVIEW: 'review.delete_review',
  LIST_REVIEWS: 'review.list_reviews',
} as const;

// ======================
// MEDIA SERVICE
// ======================
export const MEDIA_PATTERNS = {
  CREATE_UPLOAD_URL: 'media.create_upload_url',
  ATTACH_FILE: 'media.attach_file',
} as const;
