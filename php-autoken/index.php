<?php

include 'Autoken.php';
header('Content-Type: text/plain', true, 200);

ob_start(); // to send cookie at the end

echo "Unpacked data:\n";
var_dump(Autoken::instance()->getAll());

Autoken::instance()->set('user_id', 999);
Autoken::instance()->save();

echo "\nCurrent token: " . Autoken::instance()->build();
