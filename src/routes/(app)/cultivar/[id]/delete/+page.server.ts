import { IdSchema } from '$lib/schemas';
import { auditTrail } from '$lib/services/Logger';
import { CULTIVAR, DELETE, validateData } from '$lib/utils';
import { error, fail, redirect, type Actions } from '@sveltejs/kit';
import type { ClientResponseError } from 'pocketbase';

export const load = async ({ locals }) => {
	if (!locals.pb.authStore.isValid) {
		throw redirect(303, '/login');
	}
};

export const actions: Actions = {
	delete: async ({ request, locals }) => {
		if (!locals.user) {
			throw fail(400);
		}

		const { formData, errors } = await validateData(await request.formData(), IdSchema);

		if (errors) {
			return fail(400, {
				data: formData,
				errors: errors.fieldErrors
			});
		}

		try {
			const record = await locals.pb.collection(CULTIVAR).delete(formData.id);

			await auditTrail(locals.pb, CULTIVAR, formData.id, DELETE, locals.user.id);
		} catch (err) {
			console.log('Error: ', err);
			const e = err as ClientResponseError;
			throw error(e.status, e.message);
		}

		throw redirect(303, '/cultivar');
	}
};
