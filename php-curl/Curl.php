<?php

class Curl {
	public $ch = null;
	public $response = null;
	private $addedHeaders = [];
	protected $method = 'GET';
	protected $url = '';
	
	public function __construct($method, $url) {
		$this->ch = curl_init();
		$this->setRequestMethod($method);
		$this->setUrl($url);
	}
	
	public static function buildUrl($url, $add = null) {
		if (!is_array($url))
			$url = parse_url($url);
		
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
	
	public function setRequestMethod($value) {
		return $this->setOpt(CURLOPT_CUSTOMREQUEST , $value);
	}
	
	public function getRequestMethod() {
		return $this->method;
	}
	
	public function setUrl($value) {
		return $this->setOpt(CURLOPT_URL, $value);
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
		$this->setOpt(CURLOPT_POSTFIELDS, $value);
		if ($contentType)
			$this->setHeader("Content-Type: $contentType");
		return $this;
	}
	
	public function setPayload($value, $contentType = null) {
		if ($this->method == 'POST' || $this->method == 'PUT') {
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
	
	public function send() {
		$this->setOpt(array(
			CURLOPT_HEADER => true,
			CURLINFO_HEADER_OUT => true,
			CURLOPT_RETURNTRANSFER => true,
		));
		$this->response = self::parseHttpResponse(curl_exec($this->ch));
		return $this;
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
	
	public function getResponseBody() {
		return isset($this->response[1]) ? $this->response[1] : null;
	}
	
	public function getResponseJson() {
		return isset($this->response[1]) ? json_decode($this->response[1]) : null;
	}
	
	public function getInfo() {
		return curl_getinfo($this->ch);
	}
	
	public function getCode() {
		return curl_getinfo($this->ch, CURLINFO_RESPONSE_CODE);
	}
}
