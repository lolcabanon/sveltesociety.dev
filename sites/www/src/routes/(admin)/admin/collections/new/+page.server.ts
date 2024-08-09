import { create_content } from '$lib/server/db/content';
import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';

import { schema } from './schema.ts'

export const load = async () => {
    const form = await superValidate(zod(schema));

    return {
        form
    }
};

export const actions: Actions = {
    default: async ({ request }) => {
        const form = await superValidate(request, zod(schema));

        if (!form.valid) {
            return fail(400, { form });
        }

        const result = create_content({
            title: form.data.title,
            description: form.data.description,
            children: form.data.children,
            slug: form.data.slug,
            type: 'collection'
        });

        if (result) {
            redirect(303, '/admin/collections');
        } else {
            error(500, 'Failed to create collection');
        }
    }
};