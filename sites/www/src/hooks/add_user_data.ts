import type { Handle } from '@sveltejs/kit';
import { get_user } from '$lib/server/db/user';
import { validate_session_id } from '$lib/server/db/session';
import { redirect } from '@sveltejs/kit';

export const add_user_data: Handle = async ({ event, resolve }) => {
    const { cookies } = event;

    const session_id = cookies.get('session_id');

    if (!session_id) {
        return await resolve(event);
    }

    const { user_id } = validate_session_id(session_id);

    if (user_id === undefined) {
        redirect(302, '/');
    }

    const user = get_user(user_id)

    if (user) {
        event.locals.user = user;
    }

    const response = await resolve(event);
    return response;
};