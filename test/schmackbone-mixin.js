import {Collection, Model} from 'schmackbone';
import React from 'react';
import schmackboneMixin from '../lib/schmackbone-mixin';

describe('SchmackboneMixin', () => {
  var dummyComponent,
      model1 = new Model(),
      model2 = new Collection(),
      model3 = new Model(),
      forceUpdateSpy;

  beforeEach(() => {
    dummyComponent = new (schmackboneMixin(class Component extends React.Component {
      constructor() {
        super();

        this.model1 = model1;
        this.model2 = model2;
      }

      _getBackboneModels() {
        return [
          model1,
          model2,
          model3
        ];
      }
    }));

    forceUpdateSpy = spyOn(dummyComponent, 'forceUpdate').and.returnValue();
    dummyComponent.componentDidMount();
  });

  afterEach(() => {
    dummyComponent.componentWillUnmount();
  });

  it('calls the component\'s forceUpdate when any of its models trigger listened events', () => {
    model1.trigger('sync');
    expect(forceUpdateSpy).toHaveBeenCalled();
    model2.trigger('change');
    expect(forceUpdateSpy.calls.count()).toEqual(2);
    model3.trigger('destroy');
    expect(forceUpdateSpy.calls.count()).toEqual(3);
    model1.trigger('update');
    expect(forceUpdateSpy.calls.count()).toEqual(4);
    model1.trigger('reset');
    expect(forceUpdateSpy.calls.count()).toEqual(5);
  });

  it('removes event listeners before the component unmounts', () => {
    dummyComponent.componentWillUnmount();
    model1.trigger('sync');
    expect(forceUpdateSpy).not.toHaveBeenCalled();
    model2.trigger('change');
    expect(forceUpdateSpy).not.toHaveBeenCalled();
    model3.trigger('destroy');
    expect(forceUpdateSpy).not.toHaveBeenCalled();
    model1.trigger('update');
    expect(forceUpdateSpy).not.toHaveBeenCalled();
    model2.trigger('reset');
    expect(forceUpdateSpy).not.toHaveBeenCalled();
  });

  describe('if _getBackboneModels is defined on the component', () => {
    it('binds events to models it returns', () => {
      // should expect forceUpdate to be invoked when all three models are syncd
      model1.trigger('sync');
      expect(forceUpdateSpy).toHaveBeenCalled();
      model2.trigger('sync');
      expect(forceUpdateSpy.calls.count()).toEqual(2);
      model3.trigger('sync');
      expect(forceUpdateSpy.calls.count()).toEqual(3);
    });
  });

  describe('if _getBackboneModels is not defined on the component', () => {
    beforeEach(() => {
      dummyComponent.componentWillUnmount();
      dummyComponent._getBackboneModels = null;
      dummyComponent.componentDidMount();
    });

    it('detects backbone models and collections defined on instance properties', () => {
      model1.trigger('sync');
      expect(forceUpdateSpy).toHaveBeenCalled();
      model2.trigger('sync');
      expect(forceUpdateSpy.calls.count()).toEqual(2);
      // expect forceUpdate _not_ to get called after model3 sync now
      model3.trigger('sync');
      expect(forceUpdateSpy.calls.count()).toEqual(2);
    });
  });
});
