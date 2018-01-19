<?php

class Autoken {
	protected static $instance = null;
	protected $td = null;
	protected $cfg = array(
		'key' => 'secret#phrase%to&encrypt!token',
		'ttl' => 3600,
		'cookie' => 'autoken',
	);
	protected $token = '';
	protected $rawToken = '';
	protected $time = 0;
	protected $data = array();
	
	public function setCfg(array $cfg) {
		$this->cfg = array_merge($this->cfg, $cfg);
		return $this;
	}
	
	public function init($token = null) {
		$token = $token ? $token : (isset($_COOKIE[$this->cfg['cookie']]) ? $_COOKIE[$this->cfg['cookie']] : '');
		if ($token) {
			$this->token = $token;
			$this->rawToken = rtrim(self::decrypt($token, $this->getKey(false)), "\0");
			$this->time = unpack('Ntime', $this->rawToken)['time'];
			$this->data = unserialize(substr($this->rawToken, 4));
		}
		return $this;
	}
	
	public function build($forceRenew = false) {
		if ($forceRenew || $this->changed()) {
			$this->rawToken = pack('N', time()) . serialize($this->data);
			return $this->token = self::encrypt($this->rawToken, $this->getKey($forceRenew));
		}
		return $this->token;
	}
	
	public function save() {
		if ($this->changed()) {
			return setrawcookie(urlencode($this->cfg['cookie']), urlencode($this->build()), time() + $this->cfg['ttl']);
		}
		return false;
	}
	
	public function set($name, $value) {
		$this->data[$name] = $value;
		return $this;
	}
	
	public function unset($name) {
		unset($this->data[$name]);
		return $this;
	}
	
	public function get($name, $default = null) {
		return isset($this->data[$name]) ? $this->data[$name] : $default;
	}
	
	public function getAll() {
		return $this->data;
	}
	
	protected function getKey($renew) {
		$time = $renew || !$this->time ? time() : $this->time;
		return sha1($this->cfg['key'] . floor($time / $this->cfg['ttl']), true);
	}
	
	protected function changed() {
		return substr($this->rawToken, 4) != serialize($this->data);
	}
	
	protected static function encrypt($data, $key, $rawResult = false) {
		$td = mcrypt_module_open('rijndael-128', '', 'ofb', '');
		$iv = mcrypt_create_iv($ivSize = mcrypt_enc_get_iv_size($td), MCRYPT_DEV_URANDOM);
		mcrypt_generic_init($td, $key, $iv);
		$encrypted = $iv . mcrypt_generic($td, $data);
		mcrypt_generic_deinit($td);
		mcrypt_module_close($td);
		if (!$rawResult)
			$encrypted = base64_encode($encrypted);
		return $encrypted;
	}
	
	protected static function decrypt($encrypted, $key, $rawInput = false) {
		$td = mcrypt_module_open('rijndael-128', '', 'ofb', '');
		if (!$rawInput)
			$encrypted = base64_decode($encrypted);
		$ivSize = mcrypt_enc_get_iv_size($td);
		$iv = substr($encrypted, 0, $ivSize);
		$encrypted = substr($encrypted, $ivSize);
		mcrypt_generic_init($td, $key, $iv);
		$data = mdecrypt_generic($td, $encrypted);
		mcrypt_generic_deinit($td);
		mcrypt_module_close($td);
		return $data;
	}
	
	public function __construct($token = null, array $cfg = null) {
		if ($cfg)
			$this->setCfg($cfg);
		$this->init($token);
	}
	
	public static function instance() {
		if (!self::$instance) {
			self::$instance = new Autoken();
		}
		return self::$instance;
	}
}
