'use strict';
Vue.component('dataSource', {
  template:  `
    <ui-prop indent=1 v-prop="target.host"></ui-prop>         
    <ui-prop v-prop="target.getElementFunc"></ui-prop>   
    <ui-prop v-prop="target.bindFunc"></ui-prop> 
   `,

  props: {
    target: {
      twoWay: true,
      type: Object,
    },
  },
  methods: {
    T: Editor.T
  }
});