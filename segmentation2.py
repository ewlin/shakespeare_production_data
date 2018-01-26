# -*- coding: utf-8 -*-

from __future__ import division
import glob
import jieba
import math

songs = []

song_files = glob.glob('mayday_songs/*/*.txt')

for song_file in song_files:
    song_lines = open(song_file).read().decode('utf-8')
    songs.append(song_lines)

print(songs)

songs_with_word_segs = []
word_dist = {}
song_dist = {}
idf_table = {}
songs_meta = {}

for song in songs:
    segs = jieba.cut(song, cut_all=False)
    songs_with_word_segs.append(segs)

for index, song_words in enumerate(songs_with_word_segs):
    #create a dict reference (songs_meta)
    #calculate length of song (# of words)
    song_words = list(song_words)
    meta_data = {}
    meta_data['song'] = song_files[index]
    meta_data['length'] = len(song_words)
    meta_data['words'] = {}

    for word in song_words:
        if word in song_dist:
            if index not in song_dist[word]:
                song_dist[word].append(index)
        else:
            song_dist[word] = [index]

        if word in word_dist:
            word_dist[word] += 1
        else:
            word_dist[word] = 1

        if word in meta_data['words']:
            meta_data['words'][word]['count'] += 1
        else:
            meta_data['words'][word] = {}
            meta_data['words'][word]['count'] = 1

    songs_meta[index] = meta_data

sorted_freq = sorted(word_dist, key=lambda x: word_dist[x])
for word in sorted_freq:
    print(''.join(word + ': ' + str(word_dist[word])))

sorted_song_freq = sorted(song_dist, key=lambda x: len(song_dist[x]))
for word in sorted_song_freq:
    print(''.join(word + ': ' + str(song_dist[word])))

#IDF
for word in sorted_song_freq:
    idf = math.log(len(song_files)/len(song_dist[word]), 10)
    print(''.join(word + str(idf)))
    idf_table[word] = idf

print(len(sorted_song_freq))

#TF
for song in songs_meta:
    #print(song)
    for word in songs_meta[song]['words']:
        #print(word)
        songs_meta[song]['words'][word]['tf'] = songs_meta[song]['words'][word]['count']/songs_meta[song]['length']
        songs_meta[song]['words'][word]['tf_idf'] = songs_meta[song]['words'][word]['tf'] * idf_table[word]

print(songs_meta)



#Analysis
for song in songs_meta:
    print(songs_meta[song]['words'])
    sorted_tf_idf = sorted(songs_meta[song]['words'], key=lambda x: songs_meta[song]['words'][x]['tf_idf'])
    for word in sorted_tf_idf:
        print(''.join(word + ': ' + str(songs_meta[song]['words'][word]['tf_idf'])))
