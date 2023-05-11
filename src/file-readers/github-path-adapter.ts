export function githubPathAdapter(path: string) {
  // examples of supported cases
  // https://raw.githubusercontent.com/open-numbers/ddf--open_numbers--world_development_indicators/master
  // https://raw.githubusercontent.com/open-numbers/ddf--open_numbers--world_development_indicators/master/
  // https://raw.githubusercontent.com/open-numbers/ddf--open_numbers--world_development_indicators/master/datapackage.json

  // assumes master branch
  // https://github.com/open-numbers/ddf--open_numbers--world_development_indicators
  // https://github.com/open-numbers/ddf--open_numbers--world_development_indicators.git
  // https://github.com/open-numbers/ddf--open_numbers--world_development_indicators/blob/master/datapackage.json
  const githubusercontent = 'https://raw.githubusercontent.com/';
  const githubcom = 'https://github.com/';
  const datapackage = '/datapackage.json';
  const dotgit = '.git';
  const howManySlashes = (str: string) => (str.match(/\//g) || []).length;

  if (path.startsWith(githubusercontent)) {
    if (path.endsWith(datapackage)) {
      path = path.replace(datapackage, '');
    }
    if (path.endsWith('/')) {
      path = path.replace(/.$/, ''); // remove trailing slash
    }
    if (howManySlashes(path) === 4) {
      path = path + '/master';
    }
    return path;

  } else if (path.startsWith(githubcom)) {
    if (path.endsWith(dotgit)) {
      path = path.replace(dotgit, '');
    }
    if (path.endsWith(datapackage)) {
      path = path.replace(datapackage, '');
    }
    if (path.endsWith('/')) {
      path = path.replace(/.$/, ''); // remove trailing slash
    }

    path = path.replace(githubcom, githubusercontent);

    if (path.includes('/blob')) {
      path = path.replace('/blob', '');
    }
    if (howManySlashes(path) === 4) {
      path = path + '/master';
    }
    return path;

  } else {
    return path;
  }
}
