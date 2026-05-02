  /*
  normalised paths should look like this:
  https://raw.githubusercontent.com/open-numbers/repository/refs/heads/branch - for github only, no trailing slahs, no filename in the end
  https://domain.com/path/ddf--gapminder--systema_globalis - for any other host

  examples of supported cases
  custom hosting
  https://domain.com/path/ddf--gapminder--systema_globalis - not github and not at githubusercontent, left as is
  https://domain.com/path/ddf--gapminder--systema_globalis/ - trailing slash removed
  https://domain.com/path/ddf--gapminder--systema_globalis/datapackage.json - datapackage file in the end removed

  githubusercontent prefix
  https://raw.githubusercontent.com/open-numbers/ddf--gapminder--systema_globalis/refs/heads/develop - already good
  https://raw.githubusercontent.com/open-numbers/ddf--gapminder--systema_globalis/refs/heads/develop/datapackage.json - datapackage file in the end
  https://raw.githubusercontent.com/open-numbers/ddf--gapminder--systema_globalis/refs/heads/develop/ - trailing slash

  github prefix
  https://github.com/open-numbers/ddf--gapminder--systema_globalis - plain, possible trailing slash, assumes master branch
  https://github.com/open-numbers/ddf--gapminder--systema_globalis.git - with .git, assumes master branch
  https://github.com/open-numbers/ddf--gapminder--systema_globalis/tree/develop - with branch, possible trailing slash
  https://github.com/open-numbers/ddf--gapminder--systema_globalis/blob/develop/datapackage.json - blob and specific file

  */

export function githubPathAdapter(path: string) {

  const githubusercontent = 'https://raw.githubusercontent.com/';
  const githubcom = 'https://github.com/';
  const datapackage = '/datapackage.json';
  const dotgit = '.git';

  if (path.endsWith(datapackage)) {
    path = path.replace(datapackage, '');
  }
  if (path.endsWith('/')) {
    path = path.replace(/.$/, ''); // remove trailing slash
  }

  if (path.startsWith(githubusercontent)) {
    return path;
  } else if (path.startsWith(githubcom)) {
    if (path.endsWith(dotgit)) {
      path = path.replace(dotgit, '');
    }
    if (!path.includes('/blob') && !path.includes('/tree')) {
      path = path + '/tree/master'; // assume master branch if none specified
    }
    if (path.includes('/blob')) {
      path = path.replace('/blob', '/refs/heads'); // replace blob with refs/heads
    }
    if (path.includes('/tree')) {
      path = path.replace('/tree', '/refs/heads'); // replace tree with refs/heads
    }
    path = path.replace(githubcom, githubusercontent);

    return path;

  } else {
    return path;
  }
}
