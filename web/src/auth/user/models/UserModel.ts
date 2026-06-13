import _ from 'lodash';
import type { PartialDeep } from 'type-fest';
import { type User } from '@/auth/user';

function UserModel(data?: PartialDeep<User>): User {
	data = data || {};

	return _.defaults(data, {
		id: null,
		email: '',
		display_name: null,
		role_id: null,
		role: null,
		is_active: false,
		created_at: null,
		updated_at: null,
		permissions: [],
		loginRedirectUrl: '/'
	}) as User;
}

export default UserModel;
