/**
 * @param {[{ isSystem: boolean, toPost?: { id: string }, toPostId: string }]} relations
 * @param {string} type
 */
export function isOfPostType (relations, type) {
  return (
    relations.some(
      (relation) =>
        relation.isSystem && (relation.toPost?.id || relation.toPostId) === type
    ) && type
  )
}

export const getPostType = (post) => {
  return (
    isOfPostType(post.outRelations, 'system') ||
    isOfPostType(post.outRelations, 'entity') ||
    isOfPostType(post.outRelations, 'bio') ||
    isOfPostType(post.outRelations, 'review') ||
    null
  )
}
