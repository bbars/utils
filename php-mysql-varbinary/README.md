BinaryMask -> BinaryIds lib makes interaction with binary masks a bit more comfortable.

## Input:

    <?php
    $ids = [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ];
    $shift = false;

### Binary Data:

    <?php
    $binData = BinaryIds::toBinData($ids);
    /*
    $binData:
    string(2) "�"
    */

### Binary String:

    <?php
    $binString = BinaryIds::toBinString($ids, true);
    /*
    $binString:
    string(17) "00000011 11111111"
    */

### Hexademical String:

    <?php
    $hexString = BinaryIds::toHexString($ids, true);
    /*
    $hexString:
    string(5) "03 ff"
    */

### Decoded ids array (from Binary Data):

    <?php
    $newIds = BinaryIds::fromBinData($binData);
    /*
    array(10) {
      [0]=>
      int(1)
      [1]=>
      int(2)
      [2]=>
      int(3)
      [3]=>
      int(4)
      [4]=>
      int(5)
      [5]=>
      int(6)
      [6]=>
      int(7)
      [7]=>
      int(8)
      [8]=>
      int(9)
      [9]=>
      int(10)
    }
    */
