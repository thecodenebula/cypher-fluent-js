# Cypher Fluent JS ![Tests](https://github.com/thecodenebula/cypher-fluent-js/workflows/Tests/badge.svg)

A small module to build Cypher queries

## Installing

`npm i @thecodenebula/cypher-fluent-js`

## Examples

```typescript
import {
  match,
  node,
} from '@thecodenebula/cypher-fluent-js';


const query = match(node('actor', 'Actor'), node('person', 'Person'))
      .return('actor', 'person')
      .skip(10)
      .limit(100)
      .orderBy('actor.name asc');


console.log(query.build());
```

## Documentation

TBD