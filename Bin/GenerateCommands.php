<?php
$Names = array_keys(json_decode(file_get_contents("http://redis.io/commands.json"), 1));
$Target = __DIR__.'/../Source/Commands.js';
file_put_contents($Target, "module.exports = ".json_encode($Names).';');