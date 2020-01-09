<?php

class Curl {
	public $ch = null;
	public $response = null;
	private $addedHeaders = [];
	protected $method = 'GET';
	protected $url = '';
	protected $proxy = '';
	protected $sslVerification = true;
	
	public function __construct($method, $url) {
		$this->ch = curl_init();
		$this->setRequestMethod($method);
		$this->setUrl($url);
	}
	
	public static function buildUrl($url, $add = null) {
		if (!is_array($url)) {
			$url = parse_url($url);
		}
		
		if (!empty($add)) {
			if (!is_array($add))
				$add = parse_url($add);
			
			if (!empty($add['scheme']))
				$url['scheme'] = $add['scheme'];
			if (!empty($add['user']))
				$url['user'] = $add['user'];
			if (!empty($add['pass']))
				$url['pass'] = $add['pass'];
			if (!empty($add['host']))
				unset($url['host'], $url['port'], $url['path'], $url['query'], $url['fragment']);
			elseif (!empty($add['port']))
				unset($url['port'], $url['path'], $url['query'], $url['fragment']);
			elseif (!empty($add['path'])) {
				if (!empty($url['path']) && $add['path'][0] != '/') {
					if ($url['path'][0] != '/')
						$url['path'] = '/' . $url['path'];
					$add['path'] = preg_replace('@/[^/]*$@', '/', $url['path']) . $add['path'];
				}
				unset($url['path'], $url['query'], $url['fragment']);
			}
			elseif (!empty($add['query']))
				unset($url['query'], $url['fragment']);
			elseif (!empty($add['fragment']))
				unset($url['fragment']);
			$url = array_merge($url, $add);
		}
		
		if (isset($url['query']) && is_array($url['query'])) {
			$url['query'] = http_build_query($url['query']);
		}
		
		if (empty($url['path'])) {
			$url['path'] = '/';
		}
		elseif ($url['path'][0] != '/') {
			$url['path'] = '/' . $url['path'];
		}
		
		return
			 (isset($url['scheme']) ? $url['scheme'] . '://' : '')
			.(isset($url['user']) ? $url['user'] . ((isset($url['pass'])) ? ':' . $url['pass'] : '') .'@' : '')
			.(isset($url['host']) ? $url['host'] : '')
			.(isset($url['port']) ? ':' . $url['port'] : '')
			.(isset($url['path']) ? $url['path'] : '')
			.(isset($url['query']) ? '?' . $url['query'] : '')
			.(isset($url['fragment']) ? '#' . $url['fragment'] : '')
		;
	}
	
	protected function setOpt($option, $value = null) {
		if (!is_array($option)) {
			return $this->setOpt(array($option => $value));
		}
		curl_setopt_array($this->ch, $option);
		
		if (isset($option[CURLOPT_CUSTOMREQUEST]))
			$this->method = strtoupper(trim($option[CURLOPT_CUSTOMREQUEST]));
		elseif (!empty($option[CURLOPT_POST]))
			$this->method = 'POST';
		elseif (!empty($option[CURLOPT_PUT]))
			$this->method = 'PUT';
		elseif (!empty($option[CURLOPT_HTTPGET]))
			$this->method = 'GET';
		
		if (isset($option[CURLOPT_URL]))
			$this->url = $option[CURLOPT_URL];
		
		return $this;
	}
	
	public function setTimeout($valueMs) {
		return $this->setOpt(CURLOPT_TIMEOUT_MS, $valueMs);
	}
	
	public function setConnectTimeout($valueMs) {
		return $this->setOpt(CURLOPT_CONNECTTIMEOUT_MS, $valueMs);
	}
	
	public function setRequestMethod($value) {
		return $this->setOpt(CURLOPT_CUSTOMREQUEST , $value);
	}
	
	public function getRequestMethod() {
		return $this->method;
	}
	
	public function setUrl($value) {
		return $this->setOpt(CURLOPT_URL, $value);
	}
	
	public function setCookieJar($cookieJarFile) {
		return $this->setOpt(array(
			CURLOPT_COOKIEJAR => $cookieJarFile,
			CURLOPT_COOKIEFILE => $cookieJarFile,
		));
	}
	
	public function setSslVerification($value) {
		$this->sslVerification = !!$value;
		return $this->setOpt(array(
			CURLOPT_SSL_VERIFYHOST => !!$value,
			CURLOPT_SSL_VERIFYPEER => !!$value,
		));
	}
	
	public function setProxy($value) {
		$proxyHost = null;
		$proxyPort = null;
		$proxyType = null;
		$proxyAuth = null;
		$proxyTunnel = null;
		if ($value) {
			$value = (preg_match('/^[^:]+:\/\//', $value) ? '' : 'http://') . $value;
			$parts = parse_url($value);
			
			$proxyHost = $parts['host'];
			$proxyPort = $parts['port'];
			if (empty($parts['port'])) {
				throw new InvalidArgumentException("Invalid proxy value: port was not set");
			}
			
			$proxyType = CURLPROXY_HTTP;
			if ($parts['scheme'] === 'socks' || $parts['scheme'] === 'socks5') {
				$proxyType = CURLPROXY_SOCKS5;
			}
			else if ($parts['scheme'] === 'socks4') {
				$proxyType = CURLPROXY_SOCKS4;
			}
			else if ($parts['scheme'] === 'http' || $parts['scheme'] === 'https') {
				$proxyType = CURLPROXY_HTTP;
			}
			else {
				throw new InvalidArgumentException("Invalid proxy value: unsupported proxy type '{$parts['scheme']}'");
			}
			
			$proxyAuth = '';
			if (!empty($parts['user'])) {
				$proxyAuth = $parts['user'] . ':' . (empty($parts['pass']) ? '' : $parts['pass']);
			}
			
			$params = array();
			if (!empty($parts['query'])) {
				parse_str($parts['query'], $params);
			}
			$proxyTunnel = !empty($params['tunnel']);
		}
		$this->proxy = $value;
		return $this->setOpt(array(
			CURLOPT_PROXY => $proxyHost,
			CURLOPT_PROXYPORT => $proxyPort,
			CURLOPT_PROXYTYPE => $proxyType,
			CURLOPT_PROXYUSERPWD => $proxyAuth,
			CURLOPT_HTTPPROXYTUNNEL => $proxyTunnel,
		));
	}
	
	public function getProxy() {
		return $this->proxy;
	}
	
	public function getUrl() {
		return $this->url;
	}
	
	public function setHeader($value) {
		$value = (array) $value;
		$this->addedHeaders = array_merge($this->addedHeaders, $value);
		return $this->setOpt(CURLOPT_HTTPHEADER, $this->addedHeaders);
	}
	
	public function setRequestHeader($value) {
		return $this->setHeader($value);
	}
	
	public function getReqestHeaders() {
		return $this->addedHeaders;
	}
	
	public function setBody($value, $contentType = null) {
		if ($contentType) {
			$this->setHeader("Content-Type: $contentType");
		}
		$this->setOpt(CURLOPT_POSTFIELDS, $value);
		return $this;
	}
	
	public function setPayload($value, $contentType = null) {
		if ($this->method === 'POST' || $this->method === 'PUT') {
			$this->setBody($value, $contentType);
		}
		else {
			if (is_string($value))
				parse_str($value, $value);
			$value = (array) $value;
			$url = parse_url($this->url);
			if (empty($url['query']))
				$url['query'] = array();
			else {
				parse_str($url['query'], $url['query']);
			}
			$url['query'] = array_merge($url['query'], $value);
			$url['query'] = http_build_query($url['query']);
			$this->setUrl(self::buildUrl($url));
		}
		
		return $this;
	}
	
	protected function onBeforeExec() {
		$this->setOpt(array(
			CURLOPT_HEADER => true,
			CURLINFO_HEADER_OUT => true,
			CURLOPT_RETURNTRANSFER => true,
		));
	}
	
	protected function onAfterExec($response) {
		$this->response = self::parseHttpResponse($response);
	}
	
	public function exec() {
		$this->onBeforeExec();
		$this->onAfterExec(curl_exec($this->ch));
		return $this;
	}
	
	public function send() {
		return $this->exec();
	}
	
	public function close() {
		$success = false;
		if ($this->ch) {
			$success = curl_close($this->ch);
			$this->ch = null;
		}
		return $success;
	}
	
	protected static function parseHttpResponse($s) {
		$res = explode("\r\n\r\n", $s, 2);
		if (preg_match('/^HTTP\/\S+\s+100\b/', $res[0])) {
			return self::parseHttpResponse($res[1]);
		}
		return $res;
	}
	
	public function getResponseHeaders() {
		return !empty($this->response[0]) ? array_filter(explode("\r\n", $this->response[0])) : null;
	}
	
	public function findResponseHeader($name, $first = false) {
		$headers = $this->getResponseHeaders();
		if (empty($headers)) {
			return null;
		}
		if ($name === null) {
			return $headers[0];
		}
		$name = $name === null ? $name : strtolower($name);
		$res = [];
		foreach ($headers as $header) {
			$header = explode(':', $header, 2);
			if (count($header) !== 2) {
				continue;
			}
			if (strtolower($header[0]) === $name) {
				if ($first) {
					return trim($header[1]);
				}
				$res[] = trim($header[1]);
			}
		}
		return $res;
	}
	
	public function getResponseBody() {
		if (!isset($this->response[1])) {
			return null;
		}
		$body = $this->response[1];
		$contentEncoding = $this->findResponseHeader('Content-Encoding', true);
		if ($contentEncoding === 'gzip') {
			$body = gzdecode($body);
		}
		else if ($contentEncoding === 'deflate') {
			$body = gzinflate($body);
		}
		return $body;
	}
	
	public function getResponseJson() {
		$body = $this->getResponseBody();
		return $body === null ? null : json_decode($body);
	}
	
	public function getInfo() {
		return curl_getinfo($this->ch);
	}
	
	public function getCode() {
		return curl_getinfo($this->ch, CURLINFO_RESPONSE_CODE);
	}
	
	public function getError() {
		$errno = curl_errno($this->ch);
		if ($errno) {
			return new CurlException(curl_error($this->ch), $errno, $this);
		}
		$httpCode = $this->getCode();
		if ($httpCode === 404) {
			return new CurlHttpError404("Not Found", $this);
		}
		if (200 > $httpCode || $httpCode >= 300) {
			return new CurlHttpError("HTTP Error $httpCode", $this);
		}
		return null;
	}
	
	///////////////////////
	
	public static function execMulti(array $curls) {
		$mh = curl_multi_init();
		
		foreach ($curls as $curl) {
			if (!is_a($curl, CLASS)) {
				continue;
			}
			curl_multi_add_handle($mh, $curl->ch);
			$curl->onBeforeExec();
		}
		
		do {
			$status = curl_multi_exec($mh, $active);
			if ($active) {
				curl_multi_select($mh);
			}
		} while ($active && $status == CURLM_OK);
		
		foreach ($curls as $curl) {
			$curl->onAfterExec(curl_multi_getcontent($curl->ch));
			if (!is_a($curl, CLASS)) {
				continue;
			}
		}
		
		curl_multi_close($mh);
	}
}

class CurlException extends Exception {
	public $c = null;
	
	public function construct($message, $code, Curl $c = null) {
		parent::construct($message, $code);
		$this->c = $c;
	}
}

class CurlHttpError extends CurlException {
	public function construct($message, Curl $c = null) {
		parent::construct($message, $c === null ? -1 : $c->getCode(), $c);
	}
}

class CurlHttpError404 extends CurlHttpError {
	public function construct($message, Curl $c = null) {
		parent::construct($message, $c);
	}
}
