/**
 * @param {MojoContext} ctx
 * @returns {Promise<boolean>}
 */
export async function loggedIn(ctx) {
  const session = await ctx.session();
  if (!session.username) {
    await ctx.render({ json: { error: 'Forbidden' }, status: 401 });
    return false;
  }
  return true;
}

/**
 * @param {MojoContext} ctx
 * @returns {Promise<boolean>}
 */
export async function isAdmin(ctx) {
  const session = await ctx.session();
  console.log(session.role);
  if (session?.role !== 'ADMIN') {
    await ctx.render({ json: { error: 'Forbidden' }, status: 401 });
    return false;
  }
  return true;
}
