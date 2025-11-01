/**
 * @param {MojoContext} ctx
 * @param {string} username
 */
export async function setSession(ctx, username, role) {
  const session = await ctx.session();
  session.username = username;
  session.role = role;
  session.expiration = 7 * 24 * 60 * 60; // 1 week expiration

  const { expiration: _, ...userData } = session;
  return userData;
}

/**
 * @param {MojoContext} ctx
 * @returns {Promise<void>}
 */
export async function deleteSession(ctx) {
  const session = await ctx.session();
  session.expires = 1;
}
