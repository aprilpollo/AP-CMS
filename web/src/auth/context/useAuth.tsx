import { useContext } from 'react';
import AuthContext, { type AuthContextType } from './AuthContext';

function useAuth(): AuthContextType {
	const context = useContext(AuthContext);

	if (!context) {
		throw new Error('useAuth must be used within a AuthRouteProvider');
	}

	return context;
}

export default useAuth;
