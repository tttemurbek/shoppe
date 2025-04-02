export enum Message {
	SOMETHING_WENT_WRONG = 'Something went wrong',
	NO_DATA_FOUND = 'THERE IS NO DATA',
	CREATE_FAILED = 'Create failed',
	UPDATE_FAILED = 'Update failed',
	REMOVE_FAILED = 'Update failed',
	UPLOAD_FAILED = 'Upload failed',
	BAD_REQUEST = 'Bad Request',

	NO_MEMBER_NICK = 'No member with that member nick',
	BLOCKED_USER = 'You have been blocked, contact restaurant!',
	WRONG_PASSWORD = 'Wrong password!',
	NOT_AUTHENTICATED = 'You are not authenticated, please login first',
	TOKEN_NOT_EXIST = 'Bearer Token is not provided!',
	ONLY_SPECIFIC_ROLES_ALLOWED = 'Allowed only for members with specific roles',
	NOT_ALLOWED_REQUEST = 'Not Allowed Request!',
	PROVIDE_ALLOWED_FORMAT = 'Please provide jpg, jpeg or png images!',
	SELF_SUBSCRIPTION_DENIED = 'Seld subscription is denied!',
}
