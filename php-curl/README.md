Yet another CURL wrapper

## Example:

    <?php
    define('GAPI', 'https://www.googleapis.com/');
    $accessToken = '<access_token>';
    
    $url = Curl::buildUrl(GAPI, '/youtube/v3/channels');
    $params = array('part' => 'snippet', 'mine' => 'true');
    
    $response = new Curl('GET', $url)
      ->setHeader("Authorization: Bearer $accessToken")
      ->setPayload($params)
      ->send()
      ->getResponseJson();
