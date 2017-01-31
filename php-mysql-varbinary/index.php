<?php

include __DIR__.'/BinaryMask.php';

###############################################################################

###############################################################################
#                                                                             #
#                                                                             #
#   ACHTUNG! ACHTUNG! ACHTUNG! ACHTUNG! ACHTUNG! ACHTUNG! ACHTUNG! ACHTUNG!   #
#                                                                             #
#   FURTHER READING STRONGLY NOT RECOMMENDED! EYE PAIN GUARANTEED!!!!!11!1!   #
#                                                                             #
#                 YOU MIGHT BE LOOKING FOR FILE BinaryMask.php                #
#                                                                             #
#                                                                             #
###############################################################################

###############################################################################

###############################################################################

###############################################################################

###############################################################################

###############################################################################

###############################################################################

###############################################################################

###############################################################################

###############################################################################

###############################################################################

###############################################################################

###############################################################################

###############################################################################

###############################################################################

###############################################################################

###############################################################################

################################## KEEP CALM ##################################

ini_set('short_open_tag', 1);

function calcTime($name = '') {
	static $lastTime;
	$now = microtime(1);
	if ($lastTime)
		echo ($name ? "$name:\t" : '').($now - $lastTime) . "\n";
	$lastTime = $now;
}

class DB extends mysqli {
	protected $cfg = array(
		'host' => 'localhost',
		'port' => 3306,
		'user' => 'root',
		'password' => '',
		'base' => null,
		'socket' => null,
	);
	
	public function __construct(array $cfg = null) {
		$this->cfg = array_merge($this->cfg, $cfg);
		$this->cfg = (object) $this->cfg;
		parent::__construct($this->cfg->host, $this->cfg->user, $this->cfg->password, $this->cfg->base, $this->cfg->port, $this->cfg->socket);
	}
	
	public function selectAll($q) {
		$result = $this->query($q);
		if (!$result)
			return false;
		$res = [];
		while ($row = $result->fetch_object())
			$res[] = $row;
		$result->close();
		return $res;
	}
}

$MODE = isset($_GET['mode']) ? $_GET['mode'] : '';

?>
<ol>
	<li><a href="?mode=usage">Usage</a></li>
	<li><a href="?mode=benchmark">Benchmark</a></li>
	<li><a href="?mode=source">Source</a></li>
</ol>
<?

if ($MODE == 'benchmark') {
	$benchmarkIterations = max(1, isset($_GET['i']) ? $_GET['i'] : 1000);
	$benchmarkSize =  max(1, isset($_GET['s']) ? $_GET['s'] : 1000);
	
	$ids = range(1, $benchmarkSize + 1);
	calcTime();
	
	?>
	<h2>Config</h2>
	<form>
		<input type="hidden" name="mode" value="benchmark">
		<p>
			<label>
				Iterations count:
				<input type="number" name="i" value="<?= $benchmarkIterations ?>" step="1" min="1" />
			</label>
		</p>
		<p>
			<label>
				Sample array size:
				<input type="number" name="s" value="<?= $benchmarkSize ?>" step="1" min="0" />
			</label>
		</p>
		<p><button>Submit</button></p>
	</form>
	<?
	
	?><h2>Results</h2><pre><?
	for ($iter = 0; $iter < $benchmarkIterations; $iter++)
		$bytes = BinaryIds::toBytes($ids);
	calcTime('BinaryIds::toBytes');
	
	for ($iter = 0; $iter < $benchmarkIterations; $iter++)
		$binData = BinaryIds::toBinData($ids);
	calcTime('BinaryIds::toBinData');
	
	for ($iter = 0; $iter < $benchmarkIterations; $iter++)
		$binString = BinaryIds::toBinString($ids, true);
	calcTime('BinaryIds::toBinString');
	
	for ($iter = 0; $iter < $benchmarkIterations; $iter++)
		$hexString = BinaryIds::toHexString($ids);
	calcTime('BinaryIds::toHexString');
	
	for ($iter = 0; $iter < $benchmarkIterations; $iter++)
		$newIds = BinaryIds::fromBinData($binData);
	calcTime('BinaryIds::fromBinData');
	?></pre><?
}
elseif ($MODE == 'usage') {
	$ids = range(1, 10);
	if (isset($_GET['ids'])) {
		$ids = preg_split('/[^\d]+/', trim($_GET['ids']));
		$ids = array_map(function ($id) {
			$id = (int) trim($id);
			return $id > 0 ? $id : false;
		}, $ids);
		$ids = array_filter($ids);
	}
	$shift = !empty($_GET['shift']);
	
	$shifted = -1;
	$bytes = BinaryIds::toBytes($ids, $shift);
	$binData = BinaryIds::toBinData($ids, $shift, $shifted);
	$binString = BinaryIds::toBinString($ids, true, $shift, $shifted);
	$hexString = BinaryIds::toHexString($ids, true, $shift, $shifted);
	$newIds = BinaryIds::fromBinData($binData, $shifted);
	?>
	<style>pre, code { word-break: break-all; } b.focus { outline: rgba(0,0,0, 0.4) 1px dotted; }</style>
	<form>
		<input type="hidden" name="mode" value="usage">
		<p>
			<label>
				Ids array:
				<textarea style="width: 100%" name="ids"><?= implode(', ', $ids) ?></textarea>
			</label>
		</p>
		<p>
			<label>
				<input type="checkbox" name="shift" value="1"<?= $shift ? ' checked' : '' ?>> Shift (trim trailing zero bytes)
			</label>
		</p>
		<p><button>Submit</button></p>
	</form>
	
	<h2>Input:</h2>
	<? ob_start() ?>
$ids = [ <?= implode(', ', $ids) ?> ];
$shift = <?= $shift ? 'true' : 'false' ?>;
	<? highlight_string("<?php\n".trim(ob_get_clean())); ?>
	
	<h2>Binary Data:</h2>
	<? ob_start() ?>
$binData = BinaryIds::toBinData($ids<?= $shift ? ', $shift, $shifted' : '' ?>);
/*
<? echo "\$binData:\n"; var_dump($binData); if ($shift) { echo "\n\$shifted:\n"; var_dump($shifted); } ?>
*/
	<? highlight_string("<?php\n".trim(ob_get_clean())); ?>
	
	<h2>Binary String:</h2>
	<? ob_start() ?>
$binString = BinaryIds::toBinString($ids, true<?= $shift ? ', $shift, $shifted' : '' ?>);
/*
<? echo "\$binString:\n"; var_dump($binString); if ($shift) { echo "\n\$shifted:\n"; var_dump($shifted); } ?>
*/
	<? highlight_string("<?php\n".trim(ob_get_clean())); ?>
	
	<h2>Hexademical String:</h2>
	<? ob_start() ?>
$hexString = BinaryIds::toHexString($ids, true<?= $shift ? ', $shift, $shifted' : '' ?>);
/*
<? echo "\$hexString:\n"; var_dump($hexString); if ($shift) { echo "\n\$shifted:\n"; var_dump($shifted); } ?>
*/
	<? highlight_string("<?php\n".trim(ob_get_clean())); ?>
	
	<h2>Decoded ids array:</h2>
	<? ob_start() ?>
$newIds = BinaryIds::fromBinData($binData<?= $shift ? ', $shifted' : '' ?>);
/*
<? var_dump($newIds) ?>
*/
	<? highlight_string("<?php\n".trim(ob_get_clean())); ?>
	
	<h2>Save to MySQL - query example:</h2>
	<? ob_start() ?>
$campaignId = (int) $_POST['campaign_id'];
$selectedGeoIds = (array) $_POST['target_geo']; // for example, from select[multiple]
$selectedGeoHex = '0x' . BinaryIds::toHexString($selectedGeoIds, false);
$query = "UPDATE `campaigns` SET `target_geo` = $selectedGeoHex WHERE `id` = $campaignId";
/*
<?
$campaignId = 100500;
$selectedGeoHex = '0x' . BinaryIds::toHexString($ids, false, $shift, $shifted);
$colShift = $shift ? ", `target_geo_shift` = $shifted" : '';
var_dump("UPDATE `campaigns` SET `target_geo` = {$selectedGeoHex}{$colShift} WHERE `id` = $campaignId");
?>
*/
$db->execute($query);
	<? highlight_string("<?php\n".trim(ob_get_clean())); ?>
	
	<h2>MySQL SELECT query example:</h2>
	<? ob_start() ?>
	$placeId = Core::getMyGeoLocationId(); // <?= $placeId = $ids ? $ids[array_rand($ids)] : rand(1, 10) + 1 ?>

$query = 'SELECT * FROM `campaigns` WHERE ' . BinaryIds::getSqlCondition('target_geo', $placeId<?= $shift ? ", 'target_geo_shift'" : '' ?>);
/*
<? var_dump('SELECT * FROM `campaigns` WHERE ' . BinaryIds::getSqlCondition('target_geo', $placeId, $shift ? 'target_geo_shift' : null)); ?>
*/
$selectedCampaigns = $db->fetchAll($query);
	<?
	echo highlight_string("<?php\n".trim(ob_get_clean()), 1);
	//echo preg_replace("/(\\(|\>'|\>)((&nbsp;)?target_geo_shift|target_geo|$placeId|\\\$placeId)/", '$1<b class="focus">$2</b>', highlight_string("<?php\n".trim(ob_get_clean()), 1));
}
elseif ($MODE == 'source') {
	highlight_file(__DIR__.'/BinaryMask.php');
}
