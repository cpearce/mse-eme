
# Audio (track ID 2)
/c/Program\ Files/GPAC/mp4box.exe -crypt sintel_trailer-720p-frag-cenc.xml -out sintel_trailer-720p-cenc_audio.mp4 -rem 1 sintel_trailer-720p.mp4
/c/Program\ Files/GPAC/mp4box.exe -dash 5000 -rap -segment-name sintel_trailer-720p-frag-cenc_audio -subsegs-per-sidx 5 -rem 1 sintel_trailer-720p-cenc_audio.mp4


# Video (track ID 1)
/c/Program\ Files/GPAC/mp4box.exe -crypt sintel_trailer-720p-frag-cenc.xml -out sintel_trailer-720p-cenc_video.mp4 -rem 2 sintel_trailer-720p.mp4

/c/Program\ Files/GPAC/mp4box.exe -dash 5000 -rap -segment-name sintel_trailer-720p-frag-cenc_video -subsegs-per-sidx 5 -rem 2 sintel_trailer-720p-cenc_video.mp4
    