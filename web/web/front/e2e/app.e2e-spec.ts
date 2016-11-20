import { LauzhackPage } from './app.po';

describe('lauzhack App', function() {
  let page: LauzhackPage;

  beforeEach(() => {
    page = new LauzhackPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
