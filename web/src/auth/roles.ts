/**
 * The authRoles object defines the authorization roles for the application.
 */
const authRoles = {
	/**
	 * The admin role grants access to users with the 'admin' role.
	 */
	admin: ['admin'],

	/**
	 * The user role grants access to users with the 'admin', 'editor', 'author', or 'subscriber' role.
	 */
	user: ['admin', 'editor', 'author', 'subscriber'],

	/**
	 * The onlyGuest role grants access to unauthenticated users.
	 */
	onlyGuest: []
};

export default authRoles;
