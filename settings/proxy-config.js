const proxyConfigMappings = {
  dev: {
    prefix: '/uuutalk-api',
    target: 'http://localhost:8080',
  },
  test: {
    prefix: '/uuutalk-api',
    target: 'http://localhost:8080',
  },
  prod: {
    prefix: '/uuutalk-api',
    target: 'http://localhost:8080',
  },
}

export function getProxyConfig(envType = 'dev') {
  return proxyConfigMappings[envType]
}
