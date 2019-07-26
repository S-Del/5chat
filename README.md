# nodejs_chat
Node.jsで簡単なsocket.ioチャットを作りながら勉強中  
つくりかけごはん  
  
並行してCentOSやGitなどの操作なども覚えたい

## Requirement
- [express](https://expressjs.com/ja/)
- [expressリポジトリ](https://github.com/expressjs/expressjs.com)
- [socket.io](https://socket.io/)
- [socket.ioリポジトリ](https://github.com/socketio/socket.io)

## Setup
- [Node.js](https://nodejs.org/ja/)
- [npm](https://www.npmjs.com/)
- [npmリポジトリ](https://github.com/npm/cli)
- [nvmリポジトリ](https://github.com/nvm-sh/nvm)
1. `$ curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/vx.x.x/install.sh | bash` <- vx.x.xはnvmのページにて確認
2. `$ source ~/.bashrc`
3. `$ nvm --version`
4. `$ nvm ls-remote`
5. `$ nvm install stable`
6. `$ node -v`
7. `$ npm update -g npm`
8. `$ npm -v`

## Install
`$ git clone https://github.com/drrr-py/nodejs_chat.git`  
`$ cd nodejs_chat`  
`$ npm init`  
`$ npm install express --save`  
`$ npm install socket.io --save`  

## Usage
`$ node app.js`  

## References
### CentOS7
- [CentOS7 に nvm で Node.js をインストールする - Qiita](https://qiita.com/tomy0610/items/6631a04c0e6ea8621b21)
- [メモ：CentOS7にNode.jsをNVMでインストール - Qiita](https://qiita.com/ysti/items/0c79d0d5e998e5861be2)
### Node.js / express / socket.io
- [Node.js入門](http://www.tohoho-web.com/ex/nodejs.html)
- [Express での静的ファイルの提供](https://expressjs.com/ja/starter/static-files.html)
- [Socket.IO  —  Server API | Socket.IO](https://socket.io/docs/server-api/)
- [Socket.IO  —  Client API | Socket.IO](https://socket.io/docs/client-api/)
- [Socket.IO  —  Rooms and Namespaces | Socket.IO](https://socket.io/docs/rooms-and-namespaces/)
- [Node.js + Express + Socket.ioで簡易チャットを作ってみる - Qiita](https://qiita.com/riku-shiru/items/ffba3448f3aff152b6c1)
- [Crypto | Node.js v12.7.0 Documentation](https://nodejs.org/api/crypto.html)
- [Node.jsで暗号化とハッシュ - Qiita](https://qiita.com/_daisuke/items/990513e89ca169e9c4ad)
### JavaScript
- [\[JavaScript\]null または空文字判定 - Qiita](https://qiita.com/_Hammer0724/items/3d21ef84813ee82e8252)
- [document.writeとは？ - Qiita](https://qiita.com/a12345/items/0f9f7df07d0d2cb4f668)
- [document.writeでscriptを読み込んではいけない - Qiita](https://qiita.com/aya_taka/items/1255909b3db622272cee)
- [生JSとjQueryの基本操作比較 - Qiita](https://qiita.com/shshimamo/items/ba3a57a81d9780030969)
- [ライブラリを使わない素のJavaScriptでDOM操作 - Qiita](https://qiita.com/kouh/items/dfc14d25ccb4e50afe89)
- [【JavaScript入門】addEventListener()によるイベント処理の使い方！ | 侍エンジニア塾ブログ（Samurai Blog） - プログラミング入門者向けサイト](https://www.sejuku.net/blog/57625)
- [【JavaScript入門】onloadイベントの使い方とハマりやすい注意点とは | 侍エンジニア塾ブログ（Samurai Blog） - プログラミング入門者向けサイト](https://www.sejuku.net/blog/19754)
- [【JavaScript】 文字列切り出し（slice, substr, substring）の違い - のんびり猫プログラマの日常](http://catprogram.hatenablog.com/entry/2013/05/13/231457)
- [【JavaScript入門】replaceの文字列置換・正規表現の使い方まとめ！ | 侍エンジニア塾ブログ（Samurai Blog） - プログラミング入門者向けサイト](https://www.sejuku.net/blog/21107)
### HTML
- [HTML5リファレンス](http://www.htmq.com/html5/)
- [HTML5リファレンス（ABC順）](http://www.htmq.com/html5/indexa.shtml)
### CSS
- [破綻しにくいCSS設計の法則 15 - Qiita](https://qiita.com/BYODKM/items/b8f545453f656270212a)
- [HTML5 Reset Stylesheet | HTML5 Doctor](http://html5doctor.com/html-5-reset-stylesheet/)
- [floatより辛くない「flexbox」でざっくりレイアウト - Qiita](https://qiita.com/hashrock/items/939684b9207dbab1d59e)
### Git / Markdown
- [README.mdファイル。マークダウン記法まとめ | codechord](https://codechord.com/2012/01/readme-markdown/)
- [READMEの良さそうな書き方・テンプレート【GitHub/Bitbucket】 - karaage. \[からあげ\]](https://karaage.hatenadiary.jp/entry/2018/01/19/073000)
- [GitHub での執筆 - GitHub ヘルプ](https://help.github.com/ja/categories/writing-on-github)
- [Gitでディレクトリ名やファイル名変更 - ゆずめも](https://yuzu441.hateblo.jp/entry/2013/12/27/151233)
- [Gitのコミットメッセージの書き方 - Qiita](https://qiita.com/itosho/items/9565c6ad2ffc24c09364)
