import type { Schema, Attribute } from '@strapi/strapi';

export interface TotalEnumeration extends Schema.Component {
  collectionName: 'components_total_enumerations';
  info: {
    displayName: 'Enumeration';
  };
  attributes: {};
}

declare module '@strapi/types' {
  export module Shared {
    export interface Components {
      'total.enumeration': TotalEnumeration;
    }
  }
}
