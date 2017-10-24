const mongoose = require('mongoose');
const chai = require('chai');
const Song = require('../db-mongo-music/Songs.js');
const Playlist = require('../db-mongo-music/Playlists.js');
const path = require('path');
const makeMusic = require('../data-source/music-maker.js');
const makeMongoData = require('../db-mongo-music/load-mongo-music.js');

// run tests with NODE_ENV=test to use test DB (see script in package.json)
const config = require('config');

const database = config.get('MONGO_DATABASE');
let db;
describe('Mongo Test Database', () => {
  before((done) => {
  // make a temporary db
    mongoose.connect(database, {
      useMongoClient: true
    });
    db = mongoose.connection;
    db.on('error', console.error.bind(console, 'mongo db connection error'));
    db.once('open', () => {
      done();
    });
  });
  describe('Song Schema', () => {
    it('Should save a song to Songs', () => {
      const testSong = Song({
        _id: new mongoose.Types.ObjectId(),
        intId: 3,
        title: 'Test Song',
        artist: 'Test Artist',
        songGenre: [7], // made this an array to allow future expansion to multiple song categories
        length: 3000,
        album: 'Test Album',
        year: 2000
      });
      testSong.save((err, data) => {
        if (err) return console.error('error saving to mongoDB', err);
        chai.expect(data.title).to.equal('Test Song');
        return 'here is a string to make the linter happy';
      });
    });
  });
  describe('Playlist Schema', () => {
    it('Should save a Playlist to Playlists', () => {
      const testPlaylist = Playlist({
        intId: 7,
        playlistGenre: { number: 777, name: 'great list' },
        dateLastModified: Date.now(),
        songs: ['59ece2d85764e303adb1da71']
      });
      testPlaylist.save((err, data) => {
        if (err) return console.error('error saving to DB, ', err);
        chai.expect(data.playlistGenre.number).to.equal(777);
        return 'here is a string to make the linter happy';
      });
    });
  });

  describe('Data Generation Function', () => {
    it('should generate and add 30 songs to mongoDB', () => {
      Song.insertMany(makeMusic(30))
        .then((stuff) => {
          chai.expect(stuff).to.have.lengthOf(30);
        })
        .catch(err => console.log(err));
    });
  });
  // console.log(makeMongoData.makeThousands(1)); // ->promise
  // TODO fix this test, and fix db drop to wait for it
  // Need to refactor underlying function?
  describe('Data Generation Multiplier', () => {
    xit('should add 1000 songs to mongoDB', () => {
      makeMongoData.makeThousands(1)
        .then((thousandSongs) => {
          console.log('thousandSongs: ', thousandSongs);
          // BOGUS - function actually does the inserting
          Song.insertMany(thousandSongs)
            .then((stuff) => {
              console.log('insertMany makes: ', stuff);
              chai.expect(stuff).to.have.lengthOf(1000);
            })
            .catch(err => console.log(err));
        });
    });
  });
  /*after((done) => {
    mongoose.connection.db.dropDatabase(() => {
      mongoose.connection.close(done);
    });
  });*/
  // THIS IS NOT WAITING - interrupts DB while adding 1000 recs.
});

