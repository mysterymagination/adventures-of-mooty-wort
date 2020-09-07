#!/bin/bash
idx=$1 
for i in *.png 
do 
  echo $i
  baseStr=$(basename $i .png)
  mv $i $baseStr"_"$idx".png" 
done
