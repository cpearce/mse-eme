# Encrypt sintel_trailer-720p.mp4 with the keys specified in this file, and output to |sintel_trailer-720p-cenc.mp4|


/c/Program\ Files/GPAC/mp4box.exe -crypt sintel_trailer-720p-frag-cenc.xml -out sintel_trailer-720p-cenc_video.mp4 -rem 1 sintel_trailer-720p.mp4
/c/Program\ Files/GPAC/mp4box.exe -crypt sintel_trailer-720p-frag-cenc.xml -out sintel_trailer-720p-cenc_audio.mp4 -rem 2 sintel_trailer-720p.mp4

# Fragment |sintel_trailer-720p-cenc.mp4| into 1000ms segments:

/c/Program\ Files/GPAC/mp4box.exe -dash 1000 -rap -segment-name sintel_trailer-720p-frag-cenc_audio -subsegs-per-sidx 5 -rem 2 sintel_trailer-720p-cenc_audio.mp4
/c/Program\ Files/GPAC/mp4box.exe -dash 1000 -rap -segment-name sintel_trailer-720p-frag-cenc_video -subsegs-per-sidx 5 -rem 2 sintel_trailer-720p-cenc_video.mp4

    