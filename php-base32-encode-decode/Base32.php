<?php

class Base32
{
	const BITS_5_RIGHT = 31;
	const CHARS = 'abcdefghijklmnopqrstuvwxyz234567';
	
	public static function encode($data)
	{
		$dataSize = strlen($data);
		$res = '';
		$remainder = 0;
		$remainderSize = 0;
		
		for ($i = 0; $i < $dataSize; $i++)
		{
			$b = ord($data[$i]);
			$remainder = ($remainder << 8) | $b;
			$remainderSize += 8;
			while ($remainderSize > 4)
			{
				$remainderSize -= 5;
				$c = $remainder & (self::BITS_5_RIGHT << $remainderSize);
				$c >>= $remainderSize;
				$res .= static::CHARS[$c];
			}
		}
		if ($remainderSize > 0)
		{
			// remainderSize < 5:
			$remainder <<= (5 - $remainderSize);
			$c = $remainder & self::BITS_5_RIGHT;
			$res .= static::CHARS[$c];
		}
		
		return $res;
	}
	
	public static function decode($data)
	{
		$data = strtolower($data);
		$dataSize = strlen($data);
		$buf = 0;
		$bufSize = 0;
		$res = '';
		$charMap = array_flip(str_split(static::CHARS)); // char=>value map
		
		for ($i = 0; $i < $dataSize; $i++)
		{
			$c = $data[$i];
			if (!isset($charMap[$c]))
			{
				return ('Encoded string contains unexpected char #'.ord($c)." at offset $i (using improper alphabet?)");
			}
			$b = $charMap[$c];
			$buf = ($buf << 5) | $b;
			$bufSize += 5;
			if ($bufSize > 7)
			{
				$bufSize -= 8;
				$b = ($buf & (0xff << $bufSize)) >> $bufSize;
				$res .= chr($b);
			}
		}
		
		return $res;
	}
}

class Base32hex extends Base32
{
	const CHARS = '0123456789abcdefghijklmnopqrstuv';
}
