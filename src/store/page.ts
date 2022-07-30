import { types, IType, ISimpleType, IMSTArray, SnapshotIn, SnapshotOut, flow } from 'mobx-state-tree'
import storage from '../storage'

const TagPage = types.model({
  openedTags: types.array(types.string),
  currentTag: types.optional(types.string, '/dashboard'),
  defaultOpened: types.array(types.string)
}).views(self => ({

})).actions((self) => ({
  setOpenedTags(items: IMSTArray<ISimpleType<string>>) {
    self.openedTags = items;
    storage.setKey('opened-tags', items)
  },
  addTag(tag: string) {
    self.openedTags.push(tag)
  },
  removeTag(tag: string) {
    const index = self.openedTags.findIndex(item => item === tag)
    if (index !== -1) {
      self.openedTags.splice(index, 1)
    }
  },
  setCurrentTag(tag: string) {
    const path = tag && self.openedTags.includes(tag) ? tag : '/dashboard';
    storage.setKey('current-tag', path);
    self.currentTag = path;
  },
}))
export default TagPage;