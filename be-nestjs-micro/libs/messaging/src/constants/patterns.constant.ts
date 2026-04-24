// ======================
// IAM SERVICE
// ======================
export const IAM_PATTERNS = {
  VALIDATE_TOKEN: 'iam.validate_token',
  GET_PROFILE: 'iam.get_profile',

  REGISTER: 'iam.register',
  LOGIN: 'iam.login',
  VERIFY_EMAIL: 'iam.verify_email',

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
  GET_MENU_CATEGORIES: 'catalog.category.menu_categories',
  SET_CATEGORY_ACTIVE: 'catalog.category.set_active',
  DELETE_CATEGORY: 'catalog.category.delete',
  FIND_CATEGORY: 'catalog.category.find-one',

  // Menu Item
  CREATE_MENU_ITEM: 'catalog.menu_item.create',
  UPDATE_MENU_ITEM: 'catalog.menu_item.update',
  GET_MENU_ITEM_DETAIL: 'catalog.menu_item.get_detail',
  LIST_MENU_ITEMS: 'catalog.menu_item.list',
  GET_MENU_ITEMS: 'catalog.menu_item.menu',
  GET_FEATURED_MENU_ITEMS: 'catalog.menu_item.featured',
  SET_MENU_ITEM_ACTIVE: 'catalog.menu_item.set_active',
  DELETE_MENU_ITEM: 'catalog.menu_item.delete',
} as const;

// ======================
// ORDERING SERVICE
// ======================
export const ORDERING_PATTERNS = {
  // Address
  CREATE_ADDRESS: 'ordering.address.create',
  UPDATE_ADDRESS: 'ordering.address.update',
  GET_ADDRESS_DETAIL: 'ordering.address.get_detail',
  LIST_ADDRESSES: 'ordering.address.list',
  SET_DEFAULT_ADDRESS: 'ordering.address.set_default',
  DELETE_ADDRESS: 'ordering.address.delete',

  // Cart
  GET_ACTIVE_CART: 'ordering.cart.get_active',
  ADD_CART_ITEM: 'ordering.cart.add_item',
  UPDATE_CART_ITEM: 'ordering.cart.update_item',
  REMOVE_CART_ITEM: 'ordering.cart.remove_item',
  SET_CART_ADDRESS: 'ordering.cart.set_address',
  SET_CART_NOTE: 'ordering.cart.set_note',
  CLEAR_CART: 'ordering.cart.clear',

  // Checkout
  PREVIEW_CHECKOUT: 'ordering.checkout.preview',
  PLACE_ORDER: 'ordering.checkout.place_order',
  CREATE_ORDER: 'ordering.checkout.place_order',

  // Order
  GET_ORDER_DETAIL: 'ordering.order.get_detail',
  LIST_ORDERS: 'ordering.order.list',
  CANCEL_ORDER: 'ordering.order.cancel',
  UPDATE_ORDER_STATUS: 'ordering.order.update_status',
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
