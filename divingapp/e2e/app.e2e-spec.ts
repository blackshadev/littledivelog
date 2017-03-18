import { DivingappPage } from './app.po';

describe('divingapp App', () => {
  let page: DivingappPage;

  beforeEach(() => {
    page = new DivingappPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
