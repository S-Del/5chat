# nodejs_chat
![nodejs_chat](https://github.com/S-Del/github_imgs/blob/master/nodejs_chat/chat540.gif)
Node.jsのsocket.ioを利用した[SPA](https://digitalidentity.co.jp/blog/creative/about-single-page-application.html)
のシンプルなチャットを作成中  
つくりかけごはん:rice:  
  
並行してCentOSやnginx、GitやGitHubなどの操作なども覚えたい。

## Requirement
- [nginx ](https://nginx.org/)([リポジトリ](https://github.com/nginx/nginx))
- [Node.js](https://nodejs.org/ja/)
- [socket.io ](https://socket.io/)([リポジトリ](https://github.com/socketio/socket.io))

## Setup
### nvm(バージョンマネージャ)からNode.jsをインストールし、npm(パッケージマネージャ)も導入。
- [npm ](https://www.npmjs.com/)([リポジトリ](https://github.com/npm/cli))
- [nvm (リポジトリ)](https://github.com/nvm-sh/nvm)
1. `$ curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/vx.x.x/install.sh | bash` <- vx.x.xはnvmのページにて確認
2. `$ source ~/.bashrc`
3. `$ nvm --version`
4. `$ nvm ls-remote`
5. `$ nvm install stable`
6. `$ node -v`
7. `$ npm update -g npm`
8. `$ npm -v`

## Install
### CentOS7にnginx(Webサーバ)をインストールし、ポートフォワード。
1. `$ sudo vi /etc/yum.repos.d/nginx.repo`
```nginx.repo
[nginx]
name=nginx repo
baseurl=http://nginx.org/packages/mainline/centos/7/$basearch/
gpgcheck=0
enabled=1
```
2. `$ sudo yum install nginx`
3. `$ nginx -v`
4. `$ sudo systemctl enable nginx`
5. `$ sudo firewall-cmd --add-service=http --zone=public --permanent`
6. `$ sudo firewall-cmd --add-port=80/tcp --zone=public --permanent`
7. `$ sudo firewall-cmd --list-all --zone=public`
8. `$ sudo firewall-cmd --reload`
9. `$ sudo vi /etc/nginx/conf.d/server.conf`
```
upstream chatNode {
    ip_hash;
    server localhost:8080;
}

server {
    listen      80;
    server_name localhost;

    location / {
        root  /usr/share/nginx/public;
        index index.html;
    }

    location /socket.io/ {
        proxy_pass         http://chatNode;
        proxy_http_version 1.1;
        proxy_redirect     off;
        proxy_set_header Upgrade            $http_upgrade;
        proxy_set_header Connection         "upgrade";
        proxy_set_header Host               $host;
        proxy_set_header X-Real-IP          $remote_addr;
        proxy_set_header X-Forwarded-Host   $host;
        proxy_set_header X-Forwarded-Server $host;
        proxy_set_header X-Forwarded-For    $proxy_add_x_forwarded_for;
    }
}
```
### npmからsocket.ioをインストール
1. `$ git clone https://github.com/drrr-py/nodejs_chat.git`
2. `$ cd nodejs_chat`
3. `$ sudo cp -r public /usr/share/nginx/`
4. `$ npm init`
5. `$ npm install socket.io --save`

## Usage
### Node.jsでチャットサーバを実行、nginxにてリバースプロキシ、静的ファイル提供。
1. `$ node app.js`
2. `$ sudo systemctl start nginx`

## References
参考にしたサイト等を列挙しています  
これら以外に色々と読んでいますが、自分の疑問にクリティカルな解答を得られたものだったり、
"個人的"に役に立ったと感じた記事等を列挙しています。  
※記事のタイトルやURLは変更されている可能性があります
### CentOS7
- [CentOS7 に nginx導入 - Qiita](https://qiita.com/MuuKojima/items/afc0ad8309ba9c5ed5ee)
- [Using NGINX with Node.js and Socket.IO, the WebSocket API](https://www.nginx.com/blog/nginx-nodejs-websockets-socketio/)
- [nginx - パーミッション(Linux)](https://gakumon.tech/nginx/nginx_permission.html)
- [CentOS 7 firewalld よく使うコマンド - Qiita](https://qiita.com/kenjjiijjii/items/1057af2dddc34022b09e)
- [CentOS7 に nvm で Node.js をインストールする - Qiita](https://qiita.com/tomy0610/items/6631a04c0e6ea8621b21)
- [メモ：CentOS7にNode.jsをNVMでインストール - Qiita](https://qiita.com/ysti/items/0c79d0d5e998e5861be2)
### Node.js / express / helmet / socket.io
- [Node.js入門](http://www.tohoho-web.com/ex/nodejs.html)
- [Socket.IO: the cross-browser WebSocket for realtime apps.](https://jxck.github.io/socket.io/)
- [Socket.IO  —  Server API | Socket.IO](https://socket.io/docs/server-api/)
- [Socket.IO  —  Client API | Socket.IO](https://socket.io/docs/client-api/)
- [Socket.IO  —  Rooms and Namespaces | Socket.IO](https://socket.io/docs/rooms-and-namespaces/)
- [Node.js + Express + Socket.ioで簡易チャットを作ってみる - Qiita](https://qiita.com/riku-shiru/items/ffba3448f3aff152b6c1)
- [Crypto | Node.js v12.7.0 Documentation](https://nodejs.org/api/crypto.html)
- [Node.jsで暗号化とハッシュ - Qiita](https://qiita.com/_daisuke/items/990513e89ca169e9c4ad)
- [【Node.js入門】requireの使い方とモジュールの作り方まとめ！ | 侍エンジニア塾ブログ（Samurai Blog） - プログラミング入門者向けサイト](https://www.sejuku.net/blog/77966)
### JavaScript
- [overview | options | API jsPanel](https://jspanel.de/api.html)
- [ライブラリを使わない素のJavaScriptでDOM操作 - Qiita](https://qiita.com/kouh/items/dfc14d25ccb4e50afe89)
- [生JSとjQueryの基本操作比較 - Qiita](https://qiita.com/shshimamo/items/ba3a57a81d9780030969)
- [document.writeとは？ - Qiita](https://qiita.com/a12345/items/0f9f7df07d0d2cb4f668)
- [document.writeでscriptを読み込んではいけない - Qiita](https://qiita.com/aya_taka/items/1255909b3db622272cee)
- [【JavaScript入門】addEventListener()によるイベント処理の使い方！ | 侍エンジニア塾ブログ（Samurai Blog） - プログラミング入門者向けサイト](https://www.sejuku.net/blog/57625)
- [【JavaScript入門】onloadイベントの使い方とハマりやすい注意点とは | 侍エンジニア塾ブログ（Samurai Blog） - プログラミング入門者向けサイト](https://www.sejuku.net/blog/19754)
- [\[JavaScript\] null とか undefined とか 0 とか 空文字('') とか false とかの判定について - Qiita](https://qiita.com/phi/items/723aa59851b0716a87e3)
- [JavaScript 正規表現まとめ - Qiita](https://qiita.com/iLLviA/items/b6bf680cd2408edd050f)
- [【JavaScript】 文字列切り出し（slice, substr, substring）の違い - のんびり猫プログラマの日常](http://catprogram.hatenablog.com/entry/2013/05/13/231457)
- [【JavaScript入門】replaceの文字列置換・正規表現の使い方まとめ！ | 侍エンジニア塾ブログ（Samurai Blog） - プログラミング入門者向けサイト](https://www.sejuku.net/blog/21107)
- [JavaScriptの配列の使い方まとめ。要素の追加,結合,取得,削除。 - Qiita](https://qiita.com/takeharu/items/d75f96f81ff83680013f)
- [【JavaScript】桁指定して四捨五入・切り上げ・切り捨て - Qiita](https://qiita.com/nagito25/items/0293bc317067d9e6c560)
### HTML
- [HTML5リファレンス（ABC順）](http://www.htmq.com/html5/indexa.shtml)
- [HTML5/HTML5要素一覧［ABC順］ - TAG index](https://www.tagindex.com/html5/elements/abc.html)
### CSS
- [CSS3リファレンス](http://www.htmq.com/css3/)
- [破綻しにくいCSS設計の法則 15 - Qiita](https://qiita.com/BYODKM/items/b8f545453f656270212a)
- [HTML5 Reset Stylesheet | HTML5 Doctor](http://html5doctor.com/html-5-reset-stylesheet/)
- [CSS Grid Layout を極める！（基礎編） - Qiita](https://qiita.com/kura07/items/e633b35e33e43240d363)
- [floatより辛くない「flexbox」でざっくりレイアウト - Qiita](https://qiita.com/hashrock/items/939684b9207dbab1d59e)
- [CSS3のremとemの違いについて - Qiita](https://qiita.com/masarufuruya/items/bb40d7e39f56e6c25f0d)
### Git / README / Markdown
- [README.mdファイル。マークダウン記法まとめ | codechord](https://codechord.com/2012/01/readme-markdown/)
- [READMEの良さそうな書き方・テンプレート【GitHub/Bitbucket】 - karaage. \[からあげ\]](https://karaage.hatenadiary.jp/entry/2018/01/19/073000)
- [Markdownで画像を表示する](https://gist.github.com/Tatzyr/3847141)
- [ffmpegでとにかく綺麗なGIFを作りたい - Qiita](https://qiita.com/yusuga/items/ba7b5c2cac3f2928f040)
- [GitHub での執筆 - GitHub ヘルプ](https://help.github.com/ja/categories/writing-on-github)
- [Gitでディレクトリ名やファイル名変更 - ゆずめも](https://yuzu441.hateblo.jp/entry/2013/12/27/151233)
- [Gitのコミットメッセージの書き方 - Qiita](https://qiita.com/itosho/items/9565c6ad2ffc24c09364)
- [fetch と pullの違い - Qiita](https://qiita.com/ota42y/items/e082d64f3f8b424e9b7d)
