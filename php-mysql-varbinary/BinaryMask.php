<?php

class BinaryMask {
	public static function toBytes(array $bits, $shift = false, &$shifted = 0) {
		$res = [];
		$shifted = 0;
		if (!$bits)
			return [];
		$minBit = min($bits);
		if ($minBit < 0)
			throw new Exception('Each element in the $bits array should be >=0');
		$maxBit = max($bits);
		if ($shift)
			$shifted = (int) floor($minBit / 8);
		$shiftedBits = $shifted * 8;
		$sizeInBytes = (int) ceil(($maxBit + 1) / 8) - $shifted;
		if (!$sizeInBytes)
			return [];
		$res = array_fill(0, $sizeInBytes, 0);
		foreach ($bits as $bit) {
			$bit = ((int) $bit) - $shiftedBits;
			/*
			// non-optimized code:
			$byteIndex = $sizeInBytes - floor($bit / 8) - 1;
			$bitPosition = $bit % 8;
			$res[$byteIndex] |= 1 << $bitPosition;
			continue;
			*/
			$res[$sizeInBytes - ((int) ($bit / 8)) - 1] |= 1 << ($bit % 8);
		}
		return $res;
	}
	
	public static function toBinData(array $bits, $shift = false, &$shifted = 0) {
		return call_user_func_array('pack', array_merge(['C*'], static::toBytes($bits, $shift, $shifted)));
	}
	
	public static function toBinString(array $bits, $split = false, $shift = false, &$shifted = 0) {
		return implode($split ? ' ' : '', array_map(function ($byte) {
			return substr('00000000'.decbin($byte), -8);
		}, static::toBytes($bits, $shift, $shifted)));
	}
	
	public static function toHexString(array $bits, $split = false, $shift = false, &$shifted = 0) {
		return implode($split ? ' ' : '', array_map(function ($byte) {
			return substr('00'.dechex($byte), -2);
		}, static::toBytes($bits, $shift, $shifted)));
	}
	
	public static function fromBinData($data, $shifted = 0) {
		$res = [];
		$sizeInBytes = strlen($data);
		$data = unpack('C*', $data);
		$sizeInBytes = count($data);
		$shiftedBits = $shifted * 8;
		for ($i = $sizeInBytes - 1; $i > -1; $i--) {
			$byte = $data[$i + 1];
			$bitIndex = 0;
			while ($byte && $bitIndex < 8) {
				if ($byte & 1)
					$res[] = ($sizeInBytes - $i - 1) * 8 + $bitIndex + $shiftedBits;
				$byte >>= 1;
				$bitIndex++;
			}
		}
		return $res;
	}
	
	public static function getSqlCondition($column, $bit, $shiftColumn = null) {
		if (!$shiftColumn)
			return "ASCII(SUBSTR($column, -CEIL(($bit) / 8), 1)) & (1 << (($bit) % 8))";
		else
			return "ASCII(SUBSTR($column, -(CEIL(($bit) / 8) - $shiftColumn), 1)) & (1 << (($bit) % 8))";
	}
}

class BinaryIds extends BinaryMask {
	protected function decrease($number) {
		return $number - 1;
	}
	
	protected function increase($number) {
		return $number + 1;
	}
	
	public static function toBytes(array $ids, $shift = false, &$shifted = 0) {
		return parent::toBytes(array_map('self::decrease', $ids), $shift, $shifted);
	}
	
	public static function fromBinData($data, $shifted = 0) {
		return array_map('self::increase', parent::fromBinData($data, $shifted));
	}
	
	public static function getSqlCondition($column, $id, $shiftColumn = null) {
		return parent::getSqlCondition($column, "$id - 1", $shiftColumn);
	}
	
}
