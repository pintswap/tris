#!/bin/bash


mkdir -p ./generated
for I in {1..200}
do
  convert ./source1.png -modulate 100,100,${I} ./generated/${I}
done
for I in {1..200}
do
  convert ./source2.png -modulate 100,100,${I} ./generated/$(($I + 200))
done
for I in {1..200}
do
  convert ./source3.png -modulate 100,100,${I} ./generated/$(($I + 400))
done
for I in {1..200}
do
  convert ./source4.png -modulate 100,100,${I} ./generated/$(($I + 600))
done
for I in {1..200}
do
  convert ./source5.png -modulate 100,100,${I} ./generated/$(($I + 800))
done
