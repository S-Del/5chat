# ５ちゃっと [http://5chat.site](http://5chat.site)
![５ちゃっとgif画像](https://github.com/S-Del/github_imgs/blob/master/nodejs_chat/chat540.gif)  

## 概要
Node.js の socket.io を利用したシンプルな掲示板風チャット  
できたてごはん:rice:  
[５ちゃっと](http://5chat.site)にアクセスすると利用できます  

今のところ、
- 名前変更
- トリップ機能
- ラウンジチャット
- 部屋チャット  
  
等々のチャットサイトとしての基本的な機能のみ備えています  
独自機能などは考え中:thinking:  

## 作った経緯
JavaScriptをあまり触ったことが無かったので勉強のために作成し、Node.jsを利用することでサーバーサイドもJavaScriptで記述できました。  
また、CentOS や nginx、Git や GitHub などの勉強も兼ねてこのプロジェクトを作成しました。  

## このリポジトリについて
基本的には [GitLab](https://gitlab.com/) でリポジトリ管理しているため、この GitHub では v1.0時点のソースを公開しています。(今後このリポジトリでの新しいバージョンの公開予定はありません)

## 必要なソフトウェア
以下のソフトウェアをインストールして実行する
- [nginx ](https://nginx.org/)([リポジトリ](https://github.com/nginx/nginx))
- [Node.js](https://nodejs.org/ja/)
- [socket.io ](https://socket.io/)([リポジトリ](https://github.com/socketio/socket.io))
- [log4js (リポジトリ)](https://github.com/log4js-node/log4js-node)

## インストール手順
### CentOS に nginx(Webサーバ) をインストールし、ポートフォワード。
1. `$ sudo vi /etc/yum.repos.d/nginx.repo`  
    以下の内容を書き込む  
    ```repo:nginx.repo
    [nginx]
    name=nginx repo
    baseurl=http://nginx.org/packages/mainline/centos/7/$basearch/
    gpgcheck=0
    enabled=1
    ```
2. `$ sudo yum install nginx`
3. `$ nginx -v`
4. `$ sudo systemctl enable nginx` <- nginxを自動起動させない場合は不要
5. `$ sudo firewall-cmd --add-service=http --zone=public --permanent`
6. `$ sudo firewall-cmd --list-all --zone=public`
7. `$ sudo firewall-cmd --reload`
### CentOS に nvm(バージョンマネージャ) から Node.js をインストールし、npm(パッケージマネージャ) も導入。
- [npm ](https://www.npmjs.com/)([リポジトリ](https://github.com/npm/cli))
- [nvm (リポジトリ)](https://github.com/nvm-sh/nvm)
1. `$ curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/vx.x.x/install.sh | bash` <- vx.x.xはnvmのリポジトリページにて確認
2. `$ source ~/.bashrc`
3. `$ nvm --version`
4. `$ nvm ls-remote`
5. `$ nvm install stable`
6. `$ node -v`
7. `$ npm update -g npm`
8. `$ npm -v`
### npm から socket.io と log4js をインストール
1. `$ npm init`
2. `$ npm install socket.io`
3. `$ npm install log4js`
### リポジトリのクローンとファイルの配置
1. `$ cd <このアプリケーションを配置するディレクトリ>`
2. `$ git clone https://github.com/drrr-py/nodejs_chat.git`
3. `$ cd nodejs_chat`
4. `$ sudo mkdir /var/www/` <- wwwディレクトリが存在するならば不要
5. `$ sudo cp -r public/ /var/www/`
6. `$ sudo cp chat_node.conf /etc/nginx/conf.d/` <- /var/www/以外に配置したならばlocationのrootを編集する

## サーバーの起動
### Node.js と nginx を起動
1. `$ node app.js`
2. `$ sudo systemctl start nginx`  
nginxは静的ファイルを提供し、socket.ioの処理はNode.jsへ流す(リバースプロキシ)。

## 参考にしたサイト
順不同で列挙しています  
これら以外に色々と読んでいますが、自分の疑問にクリティカルな解答を得られたものだったり、
"個人的"に役に立ったと感じた記事等を列挙しています。  
※記事のタイトルや URL は変更されている可能性があります
### CentOS7 / nginx
- [CentOS7 に nginx導入 - Qiita](https://qiita.com/MuuKojima/items/afc0ad8309ba9c5ed5ee)
- [Using NGINX with Node.js and Socket.IO, the WebSocket API](https://www.nginx.com/blog/nginx-nodejs-websockets-socketio/)
- [nginx - パーミッション(Linux)](https://gakumon.tech/nginx/nginx_permission.html)
- [WEBレスポンススピード高速化委員会〜nginxでgzip圧縮有効化編 - Qiita](https://qiita.com/master-of-sugar/items/71bc7f4c0746b0e04a07)
- [Nginx設定の肝 - がとらぼ](https://gato.intaa.net/freebsd/memo/nginx_settings)
- [CentOS 7 firewalld よく使うコマンド - Qiita](https://qiita.com/kenjjiijjii/items/1057af2dddc34022b09e)
- [[Sy] nginx（リバースプロキシ）+node.jsでクライアントのIPがすべて127.0.0.1になってしまう場合の対処 | Syntax Error.](https://utano.jp/entry/2015/07/nginx-proxy-get-remote-address/)
- [nginxでIPアドレス指定でのアクセスを弾く - YoshinoriN's Memento](https://yoshinorin.net/2018/06/05/nginx-block-ip-access/)
- [CentOS7でタイムゾーンの変更をしました。 - Qiita](https://qiita.com/pugiemonn/items/bfcbfaa3caae614bb076)
- [CentOS7 に nvm で Node.js をインストールする - Qiita](https://qiita.com/tomy0610/items/6631a04c0e6ea8621b21)
- [メモ：CentOS7にNode.jsをNVMでインストール - Qiita](https://qiita.com/ysti/items/0c79d0d5e998e5861be2)
### Node.js / socket.io / crypto / log4js
- [Node.js入門](http://www.tohoho-web.com/ex/nodejs.html)
- [【Node.js入門】requireの使い方とモジュールの作り方まとめ！ | 侍エンジニア塾ブログ（Samurai Blog） - プログラミング入門者向けサイト](https://www.sejuku.net/blog/77966)
- [Socket.IO: the cross-browser WebSocket for realtime apps.](https://jxck.github.io/socket.io/)
- [Socket.IO  —  Server API | Socket.IO](https://socket.io/docs/server-api/)
- [Socket.IO  —  Client API | Socket.IO](https://socket.io/docs/client-api/)
- [Socket.IO  —  Rooms and Namespaces | Socket.IO](https://socket.io/docs/rooms-and-namespaces/)
- [Node.js + Express + Socket.ioで簡易チャットを作ってみる - Qiita](https://qiita.com/riku-shiru/items/ffba3448f3aff152b6c1)
- [Crypto | Node.js v12.7.0 Documentation](https://nodejs.org/api/crypto.html)
- [Node.jsで暗号化とハッシュ - Qiita](https://qiita.com/_daisuke/items/990513e89ca169e9c4ad)
- [log4js-node/docs at master · log4js-node/log4js-node · GitHub](https://github.com/log4js-node/log4js-node/tree/master/docs)
- [log4js-node/multiFile.md at master · log4js-node/log4js-node · GitHub](https://github.com/log4js-node/log4js-node/blob/master/docs/multiFile.md)
### JavaScript
- [overview | options | API jsPanel](https://jspanel.de/api.html)
- [JavaScriptのclass - Qiita](https://qiita.com/jooex/items/981824f9fb494b448a08)
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