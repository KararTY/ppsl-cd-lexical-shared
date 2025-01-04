import { SYSTEM_IDS } from './constants'

const { ENTITY, BIO, REVIEW, SYSTEM } = SYSTEM_IDS

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
    (post.id === 'system' ? SYSTEM : false) ||
    isOfPostType(post.outRelations, SYSTEM) ||
    isOfPostType(post.outRelations, ENTITY) ||
    isOfPostType(post.outRelations, BIO) ||
    isOfPostType(post.outRelations, REVIEW) ||
    null
  )
}
