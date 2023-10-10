import { types, IMSTArray, getSnapshot, IAnyModelType } from 'mobx-state-tree'
import { IComponent, IComponentType } from '@/types'
import _, { } from 'lodash'
import { v4 } from 'uuid'

function validateDate(str: string) {
  const date = Date.parse(str);
  if (isNaN(date)) throw new Error("Invalid date");

  return new Date(date);
}

export const IsoDate = types.custom({
  name: "IsoDate",
  fromSnapshot(value: string) {
    return validateDate(value);
  },
  toSnapshot(value) {
    return value.toISOString();
  },
  isTargetType(maybeDate) {
    return maybeDate instanceof Date;
  },
  getValidationMessage(snapshot) {
    // If we don't throw an error here when the snapshot is faulty (e.g. null),
    // things like types.maybeNull(IsoDate) will not work properly
    try {
      validateDate(snapshot);
      return "";
    } catch (error: any) {
      return error.message;
    }
  }
});
function deepEqual(a: any, b: any) {
  if (_.isEmpty(a) && !_.isEmpty(b)) {
    return false;
  }
  for (let k in a) {
    let equal = true;
    if (_.isPlainObject(a[k])) {
      if (_.isEmpty(a[k]) && !_.isEmpty(b[k])) {
        return false
      }
      equal = deepEqual(a[k], b[k]);
    } else {
      equal = _.isEqual(a[k], b[k]);
    }
    if (!equal) {
      return false;
    }
  }
  return true;
}

type ComponentItemKeys = 'title' | 'name'

export const ComponentItem = types.model('Component', {
  // 编辑用属性
  $origin: types.frozen({}),
  _id: types.optional(types.string, ''),
  type: types.optional(types.string, ''),
  template_id: types.optional(types.string, ''),
  project_id: types.optional(types.string, ''),
  parent_id: types.optional(types.string, ''),
  tree_id: types.optional(types.string, ''),
  title: types.optional(types.string, ''),
  name: types.optional(types.string, ''),
  icon: types.optional(types.string, ''),
  cover: types.optional(types.string, ''),
  desc: types.optional(types.string, ''),
  order: types.optional(types.number, 1),
  status: types.optional(types.number, 1),
  createdAt: types.maybe(IsoDate),
  updatedAt: types.maybe(IsoDate),
  style: types.maybe(types.model({
    display: types.optional(types.string, ''),
  })),
  attrs: types.maybe(types.model({
    path: types.optional(types.string, ''),
    selected_id: types.optional(types.string, '')
  })),
  accepts: types.optional(types.array(types.string), []),
  children: types.array(types.late((): IAnyModelType => ComponentItem))
}).views(self => ({
  toJSON() {
    const data = getSnapshot(self);
    return _.omit(data, ['data', 'children', '$origin'])
  },
  diff() {
    if (!deepEqual(self.$origin, this.toJSON())) {
      return true;
    }
    return false;
  },
})).actions(self => ({
  setAttr(key: ComponentItemKeys, value: any) {
    self[key] = value;
  },
  appendChild(type: string) {
    self.children.push(ComponentItem.create({
      $origin: {},
      _id: '',
      tree_id: self.tree_id,
      parent_id: self._id,
      project_id: self.project_id,
      template_id: self.template_id,
      type,
      title: '无',
      name: '',
      icon: '',
      cover: '',
      desc: '',
      order: self.children.length,
      status: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      accepts: self.toJSON().accepts,
      children: [],
    }))
  },
  swap(oldIndex: number, newIndex: number) {
    if (oldIndex === newIndex) {
      return;
    }
    const [removed] = self.children.splice(oldIndex, 1);
    const old = getSnapshot(removed);
    self.children.splice(newIndex, 0, ComponentItem.create(old as IComponent));
    self.children.forEach((child, i) => {
      child.setAttr('order', i);
    })
  },
  afterCreate() {
    if (self._id) {
      self.$origin = self.toJSON() as any;
    } else {
      self._id = v4();
      if (!self.tree_id) {
        self.tree_id = self._id;
      }
    }
  }
}));

const ComponentTypeItem = types.model({
  _id: types.string,
  name: types.string,
  title: types.string,
  cover: types.optional(types.string, ''),
  level: types.number,
  accepts: types.array(types.string),
})

const componentList = types.model({
  list: types.array(ComponentItem),
  types: types.array(ComponentTypeItem),
}).views(self => ({
  getList(): IComponent[] {
    return self.list.toJSON();
  },
})).actions((self) => ({
  setList(items: IComponent[]) {
    self.list = items as IMSTArray<typeof ComponentItem>;
  },
  setTypes(items: IComponentType[]) {
    self.types = items as IMSTArray<typeof ComponentTypeItem>;
  },
  canDrop(from: string, to: string) {
    const type = self.types.find(it => it.name === to);
    if (!type) {
      return false;
    }
    const result = type.accepts.length === 0 || type.accepts.includes(from);
    return result;
  },
  async fetch() {

  },
}))
export default componentList;