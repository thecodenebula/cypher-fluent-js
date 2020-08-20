import {
  call,
  callQ,
  contains,
  endsWith,
  eq,
  exists,
  gt,
  gte,
  inList,
  isNull,
  lt,
  lte,
  match,
  node,
  nodeLabel,
  not,
  pattern,
  raw,
  regex,
  relationship,
  startsWith,
  value,
  variable,
} from '../src';

describe('query builder', () => {
  it('should match basic queries', () => {
    const q1 = match(node('actor', 'Actor'), node('person', 'Person')).return('actor', 'person');
    expect(q1.build()).toMatchSnapshot();

    const q2 = match(node('n1')).optionalMatch(node('n2')).return('n1');
    expect(q2.build()).toMatchSnapshot();

    const q3 = match(relationship(node('n1'), node('n2'))).return('n1');
    expect(q3.build()).toMatchSnapshot();

    const q4 = match(relationship(relationship(node('n1'), node('n2')), node('n3'))).return('n1');
    expect(q4.build()).toMatchSnapshot();

    const q5 = match(relationship(node('n1'), node('n2')).lr()).return('n1');
    expect(q5.build()).toMatchSnapshot();

    const q6 = match(relationship(node('n1'), node('n2')).withType('LOVES')).return('n1');
    expect(q6.build()).toMatchSnapshot();

    const q7 = match(node('actor', 'Actor'), node('person', 'Person'))
      .return('actor', 'person')
      .skip(10)
      .limit(100)
      .orderBy('actor.name asc');
    expect(q7.build()).toMatchSnapshot();

    expect(q7.skip(variable('skip')).limit(variable('limit')).build()).toMatchSnapshot();
  });

  it('should do basic where statements', () => {
    const q1 = match(node('n'))
      .where(eq(raw('n.name'), 'Mike'))
      .return('n');
    expect(q1.build()).toMatchSnapshot();

    const q2 = match(node('n'))
      .where(eq(raw('n.name'), variable('name')))
      .return('n');
    expect(q2.build()).toMatchSnapshot();

    const composedWhere = eq(raw('n.name'), variable('name')).and(eq(raw('n.age'), 30));
    const otherWhere = eq(raw('n.city'), variable('city')).or(eq(raw('n.country'), variable('country')));

    const q3 = match(node('n')).where(composedWhere).where(otherWhere).return('n');
    expect(q3.build()).toMatchSnapshot();

    const q4 = match(node('n')).where(composedWhere.or(otherWhere)).return('n');
    expect(q4.build()).toMatchSnapshot();

    const q5 = match(node('m'))
      .where(
        isNull(raw('m.name')),
        startsWith(raw('m.name'), 'rafa'),
        endsWith(raw('m.name'), 'rafa'),
        contains(raw('m.name'), 'rafa'),
        regex(raw('m.name'), 'Tim.*'),
        eq(raw('m.name'), variable('name')),
        inList(raw('m.name'), variable('name')),
        gt(raw('m.age'), variable('age')),
        gte(raw('m.age'), variable('age')),
        lt(raw('m.age'), variable('age')),
        lte(raw('m.age'), variable('age'))
      )
      .return('m');
    expect(q5.build(true)).toMatchSnapshot();

    const q6 = match(node('m'))
      .where(not(eq(raw('m.name'), 'John')))
      .return('m');
    expect(q6.build()).toMatchSnapshot();

    const q7 = match(node('m')).where(nodeLabel('m', 'Actor')).return('m');
    expect(q7.build()).toMatchSnapshot();

    const q8 = match(node('m')).where(nodeLabel('m', 'Actor', 'Person')).return('m');
    expect(q8.build()).toMatchSnapshot();

    const q9 = match(node('m', 'Person'))
      .where(exists(relationship(node('m'), node(), '', 'LOVES')))
      .return('m');
    expect(q9.build()).toMatchSnapshot();

    const q10 = match(node('m')).where(exists(match(relationship(node('m'), node(), '', 'LOVES'))));
    expect(q10.return('m').build()).toMatchSnapshot();

    const q11 = match(node('m'))
      .where(pattern(relationship(node('m'), node(), '', 'LOVES')))
      .return('m');
    expect(q11.build()).toMatchSnapshot();

    const q12 = match(node('m')).where(exists(q10)).return('m');
    expect(q12.build()).toMatchSnapshot();
  });

  it('should render call queries', () => {
    const builtQuery = callQ(
      call('db.index.fulltext.queryNodes').args(value('fullText'), variable('q')).yield('node', 'score')
    )
      .where(inList(variable('labelRestriction'), raw('labels(node)')))
      .return('node', 'labels(node)', 'score')
      .orderBy('score DESC')
      .skip(variable('offset'))
      .limit(variable('limit'));
    expect(builtQuery.build()).toMatchSnapshot();
  });
});
