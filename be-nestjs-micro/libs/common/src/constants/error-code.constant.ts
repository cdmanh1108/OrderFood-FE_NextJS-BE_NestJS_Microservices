// ==================
// 1. Base Types
// ==================

export interface ErrorDefinition {
  code: string;
  message: string;
  statusCode: number;
}

type ErrorGroup = Record<string, ErrorDefinition>;

type ExtractErrorCode<T extends ErrorGroup> = T[keyof T]['code'];

// ==================
// 2. Error Definitions
// ==================

export const ERROR_DEFINITIONS = {
  common: {
    VALIDATION_ERROR: {
      code: 'VALIDATION_ERROR',
      message: 'Dữ liệu không hợp lệ',
      statusCode: 400,
    },
    BAD_REQUEST: {
      code: 'BAD_REQUEST',
      message: 'Yêu cầu không hợp lệ',
      statusCode: 400,
    },
    UNAUTHORIZED: {
      code: 'UNAUTHORIZED',
      message: 'Chưa được xác thực',
      statusCode: 401,
    },
    FORBIDDEN: {
      code: 'FORBIDDEN',
      message: 'Bạn không có quyền thực hiện thao tác này',
      statusCode: 403,
    },
    NOT_FOUND: {
      code: 'NOT_FOUND',
      message: 'Không tìm thấy dữ liệu',
      statusCode: 404,
    },
    CONFLICT: {
      code: 'CONFLICT',
      message: 'Dữ liệu bị xung đột',
      statusCode: 409,
    },
    INTERNAL_ERROR: {
      code: 'INTERNAL_ERROR',
      message: 'Lỗi hệ thống',
      statusCode: 500,
    },
  },

  iam: {
    AUTH_INVALID_CREDENTIALS: {
      code: 'AUTH_INVALID_CREDENTIALS',
      message: 'Email hoặc mật khẩu không đúng',
      statusCode: 401,
    },
    AUTH_UNAUTHORIZED: {
      code: 'AUTH_UNAUTHORIZED',
      message: 'Bạn chưa được xác thực',
      statusCode: 401,
    },
    AUTH_TOKEN_INVALID: {
      code: 'AUTH_TOKEN_INVALID',
      message: 'Token không hợp lệ',
      statusCode: 401,
    },
    AUTH_TOKEN_EXPIRED: {
      code: 'AUTH_TOKEN_EXPIRED',
      message: 'Token đã hết hạn',
      statusCode: 401,
    },
    USER_NOT_FOUND: {
      code: 'USER_NOT_FOUND',
      message: 'Không tìm thấy người dùng',
      statusCode: 404,
    },
    USER_EMAIL_ALREADY_EXISTS: {
      code: 'USER_EMAIL_ALREADY_EXISTS',
      message: 'Email đã tồn tại',
      statusCode: 409,
    },
    USER_PHONE_ALREADY_EXISTS: {
      code: 'USER_PHONE_ALREADY_EXISTS',
      message: 'Số điện thoại đã tồn tại',
      statusCode: 409,
    },
    USER_ACCOUNT_DISABLED: {
      code: 'USER_ACCOUNT_DISABLED',
      message: 'Tài khoản đã bị vô hiệu hóa',
      statusCode: 403,
    },
  },

  catalog: {
    CATEGORY_NOT_FOUND: {
      code: 'CATEGORY_NOT_FOUND',
      message: 'Không tìm thấy danh mục',
      statusCode: 404,
    },
    CATEGORY_SLUG_ALREADY_EXISTS: {
      code: 'CATEGORY_SLUG_ALREADY_EXISTS',
      message: 'Slug danh mục đã tồn tại',
      statusCode: 409,
    },
    CATEGORY_NAME_ALREADY_EXISTS: {
      code: 'CATEGORY_NAME_ALREADY_EXISTS',
      message: 'Tên danh mục đã tồn tại',
      statusCode: 409,
    },
    MENU_ITEM_NOT_FOUND: {
      code: 'MENU_ITEM_NOT_FOUND',
      message: 'Không tìm thấy món ăn',
      statusCode: 404,
    },
    MENU_ITEM_SLUG_ALREADY_EXISTS: {
      code: 'MENU_ITEM_SLUG_ALREADY_EXISTS',
      message: 'Slug món ăn đã tồn tại',
      statusCode: 409,
    },
    MENU_ITEM_SKU_ALREADY_EXISTS: {
      code: 'MENU_ITEM_SKU_ALREADY_EXISTS',
      message: 'SKU món ăn đã tồn tại',
      statusCode: 409,
    },
    MENU_ITEM_CATEGORY_NOT_FOUND: {
      code: 'MENU_ITEM_CATEGORY_NOT_FOUND',
      message: 'Danh mục của món ăn không tồn tại',
      statusCode: 404,
    },
  },

  media: {
    MEDIA_NOT_FOUND: {
      code: 'MEDIA_NOT_FOUND',
      message: 'Không tìm thấy tệp tin',
      statusCode: 404,
    },
    MEDIA_FILE_TYPE_NOT_SUPPORTED: {
      code: 'MEDIA_FILE_TYPE_NOT_SUPPORTED',
      message: 'Loại file không được hỗ trợ',
      statusCode: 400,
    },
    MEDIA_FILE_TOO_LARGE: {
      code: 'MEDIA_FILE_TOO_LARGE',
      message: 'Kích thước file vượt quá giới hạn cho phép',
      statusCode: 400,
    },
    MEDIA_UPLOAD_FAILED: {
      code: 'MEDIA_UPLOAD_FAILED',
      message: 'Upload file thất bại',
      statusCode: 500,
    },
    MEDIA_DELETE_FAILED: {
      code: 'MEDIA_DELETE_FAILED',
      message: 'Xóa file thất bại',
      statusCode: 500,
    },
    MEDIA_ACCESS_DENIED: {
      code: 'MEDIA_ACCESS_DENIED',
      message: 'Bạn không có quyền truy cập tệp tin này',
      statusCode: 403,
    },
  },
} as const;

// ==================
// 3. Flatten ERRORS
// ==================

export const ERRORS = {
  ...ERROR_DEFINITIONS.common,
  ...ERROR_DEFINITIONS.iam,
  ...ERROR_DEFINITIONS.catalog,
  ...ERROR_DEFINITIONS.media,
} as const;

// ==================
// 4. ErrorCode Type
// ==================

export type CommonErrorCode = ExtractErrorCode<typeof ERROR_DEFINITIONS.common>;
export type IamErrorCode = ExtractErrorCode<typeof ERROR_DEFINITIONS.iam>;
export type CatalogErrorCode = ExtractErrorCode<
  typeof ERROR_DEFINITIONS.catalog
>;
export type MediaErrorCode = ExtractErrorCode<typeof ERROR_DEFINITIONS.media>;

export type ErrorCode =
  | CommonErrorCode
  | IamErrorCode
  | CatalogErrorCode
  | MediaErrorCode;

// ==================
// 5. Lookup Map
// ==================

export const ERROR_CODE_MAP = Object.values(ERRORS).reduce<
  Record<string, ErrorDefinition>
>((acc, errorDef) => {
  acc[errorDef.code] = errorDef;
  return acc;
}, {});

// ==================
// 6. Helper
// ==================

export function getErrorDefinition(code: string): ErrorDefinition {
  return ERROR_CODE_MAP[code] ?? ERRORS.INTERNAL_ERROR;
}
