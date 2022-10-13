import { types } from 'mobx-state-tree'
import storage from '../storage'

const app = types.model('app', {
  isSignIn: types.boolean,
  lastVisitedAt: types.Date,
  isDebug: types.boolean,
  project_id: types.optional(types.string, ''),
}).actions(self => ({
  setIsSignIn(bool: boolean) {
    self.isSignIn = bool
  },
  setProjectId(id: string) {
    self.project_id = id;
    storage.setKey('project_id', id);
  }
}));

export default app;